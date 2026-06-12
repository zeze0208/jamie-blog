module.exports = {
  title: `Jamie Blog`, // TODO: 블로그 이름 나중에 변경
  description: `일하는 과정을 기록하는 Jamie의 블로그`,
  language: `ko`, // `ko`, `en` => currently support versions for Korean and English
  siteUrl: `https://jamieelog.netlify.app`, // 도메인 구매 후 실제 URL로 변경
  ogImage: `/og-image.png`, // Path to your in the 'static' folder
  comments: {
    utterances: {
      repo: `zeze0208/jamie-blog`,
    },
  },
  ga: '0', // Google Analytics Tracking ID
  author: {
    name: `Jamie`,
    bio: {
      role: `Product Manager`,
      description: ['일하는 과정을 기록하는', '기획과 운영을 좋아하는', 'AI를 탐구하는'],
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
