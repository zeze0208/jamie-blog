import React, { useMemo } from 'react';
import PostCardColumn from '../post-card-column';
import './style.scss';

export const CATEGORY_LABELS = {
  All: '전체',
  trend: '인사이트/트렌드',
  cto: 'CTO지망생',
  planning: '기획자로 살아남기',
  etc: 'ETC',
  featured: 'FEATURED',
};

export const CATEGORY_DESCRIPTIONS = {
  trend: '읽어볼만한 인사이트와 트렌드 기록',
  cto: '문과 출신 CSO이지만 개발과 데이터를 배우고 있는 CTO지망생. 바이브코딩, 데이터분석 등 개발 관련한 경험담 기록',
  planning: '사업기획, 서비스기획, 행사기획.. 온오프라인 기획과 관련한 업무 경험 기록',
};

// 1줄: All, featured / 2줄: trend, cto, planning, etc
const ROW1_TABS = ['All', 'featured'];
const ROW2_TABS = ['trend', 'cto', 'planning', 'etc'];

function PostTabs({ tabIndex, onChange, tabs, posts, showMoreButton }) {
  const currentTab = tabs[tabIndex];

  const tabPosts = useMemo(() => {
    if (currentTab === 'All') return posts;
    return posts.filter((post) => post.categories.includes(currentTab));
  }, [posts, currentTab]);

  const row1 = tabs.filter((t) => ROW1_TABS.includes(t));
  const row2 = tabs.filter((t) => ROW2_TABS.includes(t));

  const handleClick = (tab) => {
    const idx = tabs.indexOf(tab);
    if (idx !== -1) onChange(null, idx);
  };

  const TabButton = ({ tab }) => (
    <button
      className={`custom-tab ${currentTab === tab ? 'selected' : ''}`}
      onClick={() => handleClick(tab)}
    >
      {CATEGORY_LABELS[tab] || tab}
    </button>
  );

  return (
    <div className="post-tabs-wrapper">
      <div className="post-tabs">
        <div className="tab-row">
          {row1.map((tab) => (
            <TabButton key={tab} tab={tab} />
          ))}
        </div>
        {row2.length > 0 && (
          <div className="tab-row">
            {row2.map((tab) => (
              <TabButton key={tab} tab={tab} />
            ))}
          </div>
        )}
      </div>
      <PostCardColumn
        posts={showMoreButton ? tabPosts.slice(0, 4) : tabPosts}
        showMoreButton={showMoreButton && tabPosts.length > 4}
        moreUrl={`posts/${tabIndex === 0 ? '' : currentTab}`}
      />
    </div>
  );
}

export default PostTabs;
