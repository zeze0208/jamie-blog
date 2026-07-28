module.exports = {
  title: `생각하는 감자log`,
  description: `일하는 과정을 기록하는 감자의 블로그`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://jamieelog.netlify.app`, // 도메인 구매 후 실제 URL로 변경
  ogImage: `/og-image.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `zeze0208/jamie-blog`,
    },
  },
  ga: '0', // Google Analytics Tracking ID — '0'은 미설정 상태(더미 값). GA4 속성 생성 후 측정 ID(G-XXXXXXX)로 교체해야 실제 방문자 데이터가 수집됨.
  verification: {
    google: '', // Google Search Console 소유권 확인 코드 (meta 태그 방식). 발급 후 이 값만 채우면 자동 반영됨.
    naver: '', // 네이버 서치어드바이저 소유권 확인 코드.
  },

  // 홈 화면 상단 메인 배너
  // image: static/ 폴더에 파일을 넣고 파일명을 아래에 지정 (권장 사이즈: 1600x320px, 레티나 대응 시 3200x640px)
  mainBanner: {
    image: `/main-banner.png`,
    title: `생각하는 감자log`,
    subtitle: `일하는 과정을 기록하는 감자의 블로그`,
  },
  author: {
    name: `감자`, // GamZa
    bio: {
      role: ``,
      description: ['일하는 과정을 기록하는'],
      thumbnail: '', // 프로필 이미지 추가 시 파일명 입력 (assets/ 폴더에 넣기)
    },
    social: {
      github: ``,    // 노출 안 함 — 필요 시 URL 입력
      linkedIn: ``,  // 노출 안 함 — 필요 시 URL 입력
      email: ``,     // 노출 안 함 — 필요 시 이메일 입력
    },
  },

  // metadata for About Page
  about: {
    timestamps: [
      // =====       [Timestamp Sample and Structure]      =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!) =====
      {
        date: '',
        activity: '',
        links: {
          github: '',
          post: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
    ],

    projects: [
      // =====        [Project Sample and Structure]        =====
      // ===== 🚫 Don't erase this sample (여기 지우지 마세요!)  =====
      {
        title: '',
        description: '',
        techStack: ['', ''],
        thumbnailUrl: '',
        links: {
          post: '',
          github: '',
          googlePlay: '',
          appStore: '',
          demo: '',
        },
      },
      // ========================================================
    ],
  },
};
