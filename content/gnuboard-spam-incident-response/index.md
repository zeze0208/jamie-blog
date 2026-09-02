---
emoji: 📝
title: "회사 홈페이지가 해킹당했다 — 그누보드 스팸 61만 건 대응 기록"
subtitle: ""
date: '2026-08-17 00:00:00'
author: 감자
tags: "그누보드, PHP, Nginx, 웹보안, SEO스팸, 침해대응, 서버운영"
categories: cto
---


> 🔧 그누보드5로 운영 중인 회사 홈페이지에서 스팸 글 61만 건을 발견하고 정리한 기록이다. 웹셸 없는 순수 스팸 유입이었고, 원인은 방치된 개방 게시판이었다. sudo 권한 없이 대응해야 했던 제약 조건까지 그대로 기록해두는 초초초초초초초초보 개발일지..


먼저 보면 좋은 글: [회사 홈페이지가 해킹당했다?!](https://app.notion.com/p/3bc8752805b6811e9803fdbc43f2be16) 


<br>


## 상황


직원 소개 게시판이 광고 텍스트로 가득했다. 직원 22건 아래로 스팸이 22건.


관리자 페이지 로그인은 됐는데 글이 지워지지 않았다. 권한까지 건드렸나 싶었다.


가장 빠른 건 방화벽에서 포트를 닫는 것인데, 같은 서버에 다른 서비스 6개가 더 올라가 있었다. sudo 권한도 없어서 nginx 설정을 만질 수도 없었다. 결국 **서버는 두고 사이트만 닫는** 방법을 찾아야 했다.


그리고 다음 날 조사를 끝내고 보니, 그때 본 22건은 전체의 0.004%. 그야말로 빙산의 일각이었다. 방치된 안 쓰는 게시판에 61만 건의 스팸이 쌓여있었던 것이다. 무려 3년 동안이나!


아래는 차단 → 진단 → 정리 → 색인 복구까지의 전 과정이다. 명령어는 실행한 순서 그대로 적었다.


## 환경과 제약


| 항목    | 값                         |
| ----- | ------------------------- |
| CMS   | 그누보드5                     |
| 웹서버   | Nginx                     |
| PHP   | PHP-FPM 7.4 (2022-11 EOL) |
| DB    | MariaDB                   |
| 권한    | 일반 계정, sudo 없음            |
| 서버 구성 | 단일 서버에 PHP-FPM pool 7개 공존 |


이 제약이 대응 방식을 전부 결정했다.

- sudo 없음 → nginx 설정 수정 불가, `/var/log/nginx` 접근 불가, PHP 업그레이드 불가
- Nginx → `.htaccess` 무효
- 멀티 pool → 방화벽 포트 차단 시 다른 서비스 6개 동반 중단

<br>


## 1차 대응 — sudo 없이 사이트 단위 차단하기


### .htaccess가 안 되는 환경에서


```bash
ps aux | grep -E 'httpd|apache|nginx' | grep -v grep
```


Nginx만 떠 있다면 `.htaccess`는 무시된다. 사이트 루트에 2023년산 `.htaccess`가 남아 있었지만 3년째 아무 역할을 하지 않고 있었다.


### .user.ini + auto_prepend_file


PHP-FPM 환경에서는 `.user.ini`로 디렉토리 단위 PHP 설정을 바꿀 수 있다. `auto_prepend_file`은 `PHP_INI_PERDIR` 스코프라 여기서 지정할 수 있다. root 권한이 필요 없다.


```bash
cd /사이트경로

cat > _maintenance.php << 'EOF'
<?php
$key = 'CHANGE-ME-난수문자열';
if (isset($_GET['unlock']) && $_GET['unlock'] === $key) {
    setcookie('site_pass', $key, time()+60*60*24*30, '/');
    header('Location: /'); exit;
}
if (isset($_COOKIE['site_pass']) && $_COOKIE['site_pass'] === $key) { return; }
header('HTTP/1.1 503 Service Unavailable');
header('Retry-After: 86400');
header('Content-Type: text/html; charset=utf-8');
exit('<h1>홈페이지 점검 중입니다</h1>');
EOF

echo 'auto_prepend_file = /사이트경로/_maintenance.php' > .user.ini
chmod 644 _maintenance.php .user.ini
```


> 💡 `.user.ini`는 `user_ini.cache_ttl` 기본값 300초 동안 캐시된다. 적용과 해제 모두 최대 5분이 걸린다. 급하게 여러 번 확인하지 말고 기다릴 것.


**IP 허용 방식보다 쿠키 방식을 권한다.** 유동 IP(모바일 테더링, 가정용 회선)에서는 IP가 바뀌는 순간 본인도 차단된다. 쿠키 방식은 네트워크와 무관하고, 기기마다 한 번씩만 열쇠 URL로 접속하면 된다.


**403이 아니라 503을 쓴다.** 403은 검색엔진에 영구 차단 신호로 읽혀 색인이 통째로 빠질 수 있다. 503 + `Retry-After`는 일시적 점검이라는 신호다.


**정적 파일은 못 막는다.** `.jpg`, `.mp4`는 nginx가 직접 처리해서 PHP를 안 거친다. 게시판 스팸 페이지는 전부 PHP라 목적은 달성되지만, 한계는 알고 있어야 한다.


### 되돌리기


```bash
rm /사이트경로/.user.ini /사이트경로/_maintenance.php
```


`.user.ini`만 지워도 즉시 무력화된다.


<br>


## 2차 대응 — 침해 여부 진단


순서가 중요하다. **백업 → 진단 → 정리**. 백업 없이 지우면 원인 추적이 불가능해진다.


### 백업


```bash
# 용량 확인
du -sh /사이트경로
df -h ~

# 파일 (백그라운드, SSH 끊겨도 계속)
nohup tar -czf ~/backup_$(date +%Y%m%d).tar.gz -C /상위경로 사이트폴더 > ~/backup.log 2>&1 &

# DB 접속 정보 (그누보드5는 대문자 상수)
grep -i mysql /사이트경로/data/dbconfig.php

# DB
mysqldump -u계정 -p DB명 > ~/db_$(date +%Y%m%d).sql
```


검증까지 해야 백업이다.


```bash
tail -3 ~/db_20260813.sql          # "-- Dump completed on" 이 있어야 정상
grep -c "CREATE TABLE" ~/db_20260813.sql   # 그누보드는 30~50개
```


`tail`이 아무것도 안 뱉으면 덤프가 실패한 것이다. 파일은 0바이트로 남아 있어서 크기만 보면 속기 쉽다.


### 웹셸 탐색 5종


```bash
# 1. 업로드 폴더 내 실행 파일 — 정상이면 거의 안 나온다
find /사이트경로/data -type f \( -name "*.php*" -o -name "*.phtml" -o -name "*.inc" \) 2>/dev/null

# 2. 최근 변경된 PHP
find /사이트경로 -name "*.php" -mtime -180 -printf '%TY-%Tm-%Td %p\n' 2>/dev/null | sort -r | head -40

# 3. 악성 시그니처
grep -rl --include="*.php" -E "eval\(base64_decode|gzinflate\(base64_decode|str_rot13\(base64|assert\(\\\$_|shell_exec|passthru\(" /사이트경로 2>/dev/null

# 4. 이미지 폴더에 숨은 PHP 코드
grep -rl "<?php" /사이트경로/data/file 2>/dev/null

# 5. 지속성 확보 흔적
crontab -l
cat ~/.ssh/authorized_keys 2>/dev/null
```


**오탐 주의.** 3번에서 그누보드 기본 파일이 걸린다. `bbs/download.php`, `bbs/qadownload.php`, `lib/Excel/*`, `adm/sms_admin/*`. 이 파일들은 원래 해당 함수를 쓴다. **변경일이 오래됐는지**로 판단하면 된다.


1번에서 나오는 정상 파일도 있다. `data/dbconfig.php`, `data/cache/latest-*.php`, 그리고 각 업로드 폴더의 빈 `index.php`(디렉토리 리스팅 방지용).


우리 경우 5종 전부 깨끗했다. **서버 침입이 아니라는 결론**이 여기서 나왔다.


### 규모 파악


```sql
SELECT table_name, ROUND(data_length/1024/1024,1) AS data_mb, table_rows
FROM information_schema.tables WHERE table_schema='DB명'
ORDER BY data_length DESC LIMIT 15;
```


결과:


| 테이블         | MB      | rows    | 정체         |
| ----------- | ------- | ------- | ---------- |
| g5_write_qa | 3,078.7 | 615,094 | 게시판        |
| g5_point    | 50.9    | 607,324 | 포인트 적립 내역  |
| g5_uniqid   | 17.1    | 642,119 | 중복 등록 방지 키 |
| g5_visit    | 16.9    | 107,564 | 방문 로그      |


`g5_point`와 `g5_uniqid`가 글 수와 거의 같다는 게 결정적 단서였다. **정상 글쓰기 폼을 통해 61만 번 등록됐다**는 뜻이다. DB 직접 주입이 아니다.


### 침투 경로 확정


```sql
SELECT bo_table, bo_subject, bo_write_level, bo_use_captcha, bo_count_write
FROM g5_board ORDER BY bo_count_write DESC;
```


```plain text
qa      | 이거 안 써요        | write_level 1 | captcha 0 | 615,094
people  | 함께하는 사람들     | write_level 1 | captcha 0 |      44
email   | 이것도 지워도 되나요 | write_level 1 | captcha 0 |    -531
```


미사용 게시판 3개가 `bo_write_level=1`(누구나), `bo_use_captcha=0`으로 열려 있었다. `bo_count_write`가 음수인 게시판도 있었다(카운트가 꼬인 흔적).


### 시계열과 작성자


```sql
SELECT DATE_FORMAT(wr_datetime,'%Y-%m') AS ym, COUNT(*) FROM g5_write_qa GROUP BY ym ORDER BY ym;
SELECT mb_id, COUNT(*) AS cnt FROM g5_write_qa GROUP BY mb_id ORDER BY cnt DESC LIMIT 10;
```


2023-05부터 저강도로 시작해 2025-04부터 월 7만 건 규모로 폭증. 피크일에는 하루 2,400건(36초당 1건). 계정 2개가 전체의 98%.


회원 목록에서 `pentest0421`, `alive0049`(이름 `poc0569`) 계정이 발견됐다. 보안 점검 의뢰 이력이 없다면 외부 정찰 시도로 봐야 한다. **삭제 전에 가입일·최종 로그인·접속 IP를 기록해두는 게 좋다.** 신고 시 근거가 된다.


<br>


## 정리 — 61만 행 지우기, DELETE 말고 TRUNCATE로.


61만 행 `DELETE`는 트랜잭션 로그가 폭증하고 락이 오래 걸린다. 보존 대상만 빼고 `TRUNCATE`가 훨씬 빠르다.


```sql
-- 1. 보존 대상 백업
CREATE TABLE bak_qa_admin AS SELECT * FROM g5_write_qa WHERE mb_id='admin';
SELECT COUNT(*) FROM bak_qa_admin;

-- 2. 비우기 (초 단위)
TRUNCATE TABLE g5_write_qa;

-- 3. 복원
INSERT INTO g5_write_qa SELECT * FROM bak_qa_admin;
```


`TRUNCATE`는 `innodb_file_per_table`이 켜져 있으면 `.ibd` 파일을 재생성해 **OS 레벨까지 공간을 반환**한다. 3.2GB → 103MB.


### 부수 테이블


```sql
DELETE FROM g5_board_new  WHERE bo_table='qa';
DELETE FROM g5_board_file WHERE bo_table='qa';
UPDATE g5_board SET bo_count_write=5 WHERE bo_table='qa';
TRUNCATE TABLE g5_uniqid;   -- 중복방지용 임시 데이터
TRUNCATE TABLE g5_point;    -- 포인트 미사용 시
```


### 부분 삭제가 필요한 게시판


정상 글이 섞여 있으면 `wr_id` 경계를 확인하고 자른다.


```sql
SELECT wr_id, mb_id, wr_name, wr_datetime, LEFT(wr_subject,40) FROM g5_write_people ORDER BY wr_id;
SELECT COUNT(*) FROM g5_write_people WHERE wr_id >= 47;   -- 먼저 세어본다
DELETE FROM g5_write_people WHERE wr_id >= 47;
DELETE FROM g5_board_new  WHERE bo_table='people' AND wr_id >= 47;
DELETE FROM g5_board_file WHERE bo_table='people' AND wr_id >= 47;

UPDATE g5_board SET bo_count_write =
  (SELECT COUNT(*) FROM g5_write_people WHERE wr_is_comment=0)
WHERE bo_table='people';
```


> ⚠️ 삭제 전 반드시 `SELECT COUNT(*)`로 예상 건수를 확인하고 실행한다. 이 습관 하나가 정상 데이터를 지키는 마지막 방어선이다.


### 물리 파일


DB만 지우면 이미지가 서버에 남아 URL로 직접 열리고 검색엔진에도 잡힌다.


그누보드 업로드 파일명은 `{시드}_{랜덤}_{해시}.확장자` 구조인데, **같은 게시글 묶음은 앞 시드가 같다.** 정상 파일과 스팸 파일의 시드를 대조하면 정확히 골라낼 수 있다.


```bash
# 기간으로 후보 추출 후 시드 목록 확인
find /사이트경로/data/file/people -type f -newermt "2026-07-10" -printf "%f\n" \
  | sed 's/^thumb-//' | cut -d_ -f1 | sort -u

# 정상 시드가 섞이지 않았는지 검증 (0이어야 함)
find /사이트경로/data/file/people -type f -newermt "2026-07-10" \
  | grep -cE "정상시드1|정상시드2|정상시드3"

# 삭제
find /사이트경로/data/file/people -type f -newermt "2026-07-10" -delete
```


`thumb-` 접두 파일은 조회 시 자동 재생성되므로 지워도 무방하다. 다만 **각 업로드 폴더의** **`index.php`****는 반드시 남긴다.** 디렉토리 리스팅 방지 파일이다.


전량 삭제가 부담스러우면 삭제 대신 이동이 안전하다.


```bash
mkdir -p ~/removed_files
find /사이트경로/data/file/qa -type f ! -name "index.php" -exec mv {} ~/removed_files/ \;
```


### 계정 정리와 재발 방지


```sql
DELETE FROM g5_member WHERE mb_id LIKE 'zx%' AND mb_name='김도현';
DELETE FROM g5_member WHERE mb_id IN ('봇계정1','봇계정2', ...);

-- 핵심
UPDATE g5_board SET bo_write_level=10, bo_use_captcha=1
WHERE bo_table IN ('qa','people','email','free');
```


그누보드5에는 회원가입을 끄는 설정 컬럼이 없다. 가입 자체를 막으려면 파일을 비활성화한다.


```bash
cd /사이트경로/bbs
mv register.php register.php.disabled
mv register_form.php register_form.php.disabled
```


<br>


## 후속 — 검색엔진 색인 정리


### 그누보드의 soft 404 문제


삭제된 글 URL에 접근하면 "글이 존재하지 않습니다" 화면이 뜨지만, **HTTP 상태 코드는 200**이다.


```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://도메인/bbs/board.php?bo_table=qa&wr_id=12345"
```


구글은 이걸 soft 404로 추정 처리하는데, 명시적 404/410보다 색인 제거가 훨씬 느리다. 61만 개면 체감 차이가 크다.


### 410 Gone 처리


차단에 썼던 `auto_prepend_file`을 그대로 재활용할 수 있다.


```php
<?php
if (strpos($_SERVER["SCRIPT_NAME"], "/adm/") !== false) return;
if (!isset($_GET["bo_table"])) return;
$bo = $_GET["bo_table"];
$wr = isset($_GET["wr_id"]) ? (int)$_GET["wr_id"] : 0;
$gone = ($bo === "qa") || ($bo === "people" && $wr >= 47 && $wr <= 68);
if (!$gone) return;
header("HTTP/1.1 410 Gone");
header("X-Robots-Tag: noindex");
header("Content-Type: text/html; charset=utf-8");
echo "<h1>삭제된 페이지입니다</h1>";
exit;
```


`/adm/` 경로는 제외해야 관리자 페이지에서 해당 게시판을 다룰 때 걸리지 않는다.


적용 후 검증:


```bash
curl -s -o /dev/null -w "qa글: %{http_code}\n"     "https://도메인/bbs/board.php?bo_table=qa&wr_id=12345"
curl -s -o /dev/null -w "메인: %{http_code}\n"      "https://도메인/"
curl -s -o /dev/null -w "정상게시판: %{http_code}\n" "https://도메인/bbs/board.php?bo_table=people"
```


기대값 `410 / 200 / 200`. 뒤 두 개가 200이 아니면 즉시 `.user.ini`를 삭제한다.


> ⚠️ **robots.txt로 차단하면 역효과다.** 크롤러가 접근하지 못하면 410 신호 자체를 받지 못해 색인이 더 오래 남는다. 삭제된 URL은 크롤링을 허용해야 한다.


### heredoc 붙여넣기 사고 주의


터미널에 heredoc(`cat > file << 'EOF'`)을 붙여넣다가 앞부분이 잘려 파일이 깨지는 일이 실제로 있었다. `<?php` 앞에 텍스트가 들어가면 헤더 전송이 깨지면서 사이트 전체가 망가진다.


```bash
# 붙여넣기 사고 방지: printf로 한 줄씩
printf '%s\n' '<?php' > _gone.php
printf '%s\n' 'if (!isset($_GET["bo_table"])) return;' >> _gone.php

# 적용 전 반드시 검증
php -l _gone.php    # No syntax errors detected
```


**설정 파일을 만들기 전에 대상 PHP 파일부터 문법 검증한다.** 순서를 지키면 사이트가 깨질 일이 없다.


<br>


## 백업 파일 처리


DB 덤프에는 회원 정보와 접속 설정이 평문으로 들어 있다. 재침해 시 그대로 유출된다. 로컬로 옮기고 서버에서는 삭제한다.


```bash
# 무결성 대조 (서버)
md5sum ~/backup_20260813.tar.gz
# PowerShell
# Get-FileHash -Algorithm MD5 H:\backup\backup_20260813.tar.gz

rm ~/backup_20260813.tar.gz ~/db_20260813.sql
```


보관은 3~6개월. 침해 기록이자 되돌리기용이다.


<br>


## 모니터링 쿼리


```sql
-- 신규 유입 확인
SELECT COUNT(*) FROM g5_write_people WHERE wr_datetime > '2026-08-14';

-- 게시판 권한 정기 점검
SELECT bo_table, bo_subject, bo_write_level, bo_use_captcha, bo_count_write FROM g5_board;

-- 신규 회원
SELECT mb_id, mb_name, mb_datetime FROM g5_member ORDER BY mb_datetime DESC LIMIT 10;
```


```bash
# 신규 업로드 파일
find /사이트경로/data/file -type f -newermt "2026-08-14" | wc -l
```


## 정리


**대응 체크리스트**

- [x] 노출 차단 (`.user.ini` + 503)
- [x] 파일·DB 백업 및 검증
- [x] 웹셸 5종 진단
- [x] `information_schema`로 규모 파악
- [x] `g5_board`로 침투 경로 확정
- [x] `TRUNCATE` 기반 대량 정리
- [x] 물리 파일 정리
- [x] 봇 계정 삭제, 게시판 권한 상향
- [x] 410 Gone 처리
- [ ] PHP 7.4 → 8.x (root 필요)
- [ ] KISA 무료 점검 신청
- [ ] 동일 서버 타 사이트 점검

<br>


### **남는 교훈 셋**


게시판, 폼처럼 외부에서 진입할 수 있는 것들은 미리 정리를 해야 한다. 권한을 제한해두든, 게시판을 없애든, 외부 접근 경로를 확인 해야 한다. `bo_write_level`만 낮춰도 막히지만, 애초에 존재하지 않는 게시판은 표적이 될 수 없다.


EOL 버전을 쓰고 있다면 그게 진짜 리스크다. 이번엔 열린 게시판이 문제였지 취약점이 뚫린 게 아니었다. `pentest0421` 계정이 있었다는 건 누군가 실제로 찔러봤다는 뜻이고, PHP 7.4로는 다음을 장담할 수 없다.


그리고 `sudo` 권한. 로그를 못 봐서 최초 유입 경로의 세부는 끝내 확인하지 못했다. 서버를 직접 운영한다면 root 접근 경로는 확보해두는 게 맞다.


---


<br>


이번 건은 서버를 갈아엎을 일이 아니었다. 설정 몇 개와 쿼리 몇 줄이면 끝나는 일이었고, 거기까지 가는 데 하루가 걸렸다. 그 하루의 대부분은 "뭔가 뚫린 건가, 아니면 그냥 열려 있던 건가"를 판단하는 데 썼다.


그 구분이 먼저다. 웹셸 5종 진단이 전부 깨끗하게 나오는 순간 대응 방법이 완전히 바뀌기 때문이다.


그누보드를 운영 중이라면 `SELECT bo_table, bo_subject, bo_write_level, bo_use_captcha, bo_count_write FROM g5_board;` 한 줄만 넘겨보시길. 미사용 게시판이 `write_level 1`로 남아 있다면 오늘 바로 확인해 보시길!!


<br>



```toc
```
