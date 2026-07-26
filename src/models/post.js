// 글 안에서 발견되는 첫 번째 이미지를 카드 썸네일로 사용하고,
// 이미지가 없으면 아래 기본 썸네일 목록 중 하나를 사용한다.
// static/thumbnails/ 폴더에 default-1.jpg ~ default-4.jpg 파일을 실제로 추가해야 노출된다.
// (원본 PNG는 장당 2MB 내외로 로딩이 느려서, 카드에 실제로 표시되는 크기(최대 260px 폭)
//  기준으로 640px 폭 JPEG로 리사이즈/압축해 장당 30~50KB 수준으로 줄임)
// (매번 바뀌면 화면이 산만해지므로 글마다 고정되도록, 매 렌더링마다 무작위가 아니라
//  글 id를 기준으로 항상 같은 이미지가 선택되도록 해시로 고른다.)
export const DEFAULT_THUMBNAILS = [
  '/thumbnails/default-1.jpg',
  '/thumbnails/default-2.jpg',
  '/thumbnails/default-3.jpg',
  '/thumbnails/default-4.jpg',
];

function extractFirstImageSrc(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

// 문자열(글 id)을 기반으로 항상 같은 결과가 나오는 간단한 해시 함수 (djb2)
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

function pickDefaultThumbnail(id) {
  const index = hashString(String(id)) % DEFAULT_THUMBNAILS.length;
  return DEFAULT_THUMBNAILS[index];
}

export default class Post {
  constructor(node) {
    const { id, html, excerpt, frontmatter, fields } = node;
    const { slug } = fields;
    const { emoji, categories, title, author, date, tags } = frontmatter;

    this.id = id;
    this.excerpt = excerpt;
    this.emoji = emoji;
    this.html = html;
    this.slug = slug;
    this.title = title;
    this.author = author;
    this.date = date;
    this.categories = categories.split(' ');
    this.tags = tags
      ? tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    this.thumbnail = extractFirstImageSrc(html) || pickDefaultThumbnail(id);
  }
}
