// 카테고리 관련 공용 설정
// gatsby-node.js(CommonJS)와 React 컴포넌트(ESM) 양쪽에서 함께 사용하기 위해
// CommonJS 형태로 내보낸다.

// 항상 고정 표시할 카테고리 목록 (글이 없어도 사이드바에 노출)
// 'All'은 전체 글을 의미하는 특수 값이다.
const FIXED_CATEGORIES = ['All', 'planning', 'cto', 'trend', 'etc'];

// 사이드바/카드/글 상세 등 사이트 전체에서 공통으로 사용하는 카테고리 표시 라벨
const CATEGORY_LABELS = {
  All: '전체',
  planning: '기획자로 살아남기',
  cto: 'CTO지망생',
  trend: '인사이트/트렌드',
  etc: 'ETC',
};

const CATEGORY_DESCRIPTIONS = {
  planning: '사업기획, 서비스기획, 행사기획.. 온오프라인 기획과 관련한 업무 경험 기록',
  cto: 'IT서비스를 만들어가는 비개발자로 일하며, 바이브코딩과 데이터분석을 배워가는 과정을 기록합니다.',
  trend: '읽어볼만한 인사이트와 트렌드 기록',
};

module.exports = { FIXED_CATEGORIES, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS };
