import React, { useMemo } from 'react';
import PostCardColumn from '../post-card-column';
import { CATEGORY_LABELS } from '../../utils/categories';
import './style.scss';

// 사이드바에 노출할 태그 최대 개수
const MAX_SIDEBAR_TAGS = 20;

// 홈 화면 등에서 한 번에 보여줄 글 개수 (더보기 버튼 노출 기준)
const POSTS_PER_PAGE = 15;

function PostTabs({ tabIndex, onChange, tabs, posts, showMoreButton }) {
  const currentTab = tabs[tabIndex];

  const tabPosts = useMemo(() => {
    if (currentTab === 'All') return posts;
    return posts.filter((post) => post.categories.includes(currentTab));
  }, [posts, currentTab]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    tabs.forEach((tab) => {
      counts[tab] = tab === 'All' ? posts.length : posts.filter((post) => post.categories.includes(tab)).length;
    });
    return counts;
  }, [tabs, posts]);

  const tagCounts = useMemo(() => {
    const counts = {};
    posts.forEach((post) => {
      (post.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_SIDEBAR_TAGS);
  }, [posts]);

  const handleClick = (tab) => {
    const idx = tabs.indexOf(tab);
    if (idx !== -1) onChange(null, idx);
  };

  return (
    <div className="post-tabs-wrapper">
      <aside className="post-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-title">카테고리</div>
          <ul className="sidebar-list">
            {tabs.map((tab) => (
              <li key={tab}>
                <button
                  className={`sidebar-item ${currentTab === tab ? 'selected' : ''}`}
                  onClick={() => handleClick(tab)}
                >
                  <span className="sidebar-item-label">{CATEGORY_LABELS[tab] || tab}</span>
                  <span className="sidebar-item-count">{categoryCounts[tab]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {tagCounts.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-title">태그</div>
            <ul className="sidebar-tag-list">
              {tagCounts.map(([tag, count]) => (
                <li key={tag} className="sidebar-tag">
                  <span className="sidebar-tag-label">#{tag}</span>
                  <span className="sidebar-item-count">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
      <div className="post-tabs-content">
        <PostCardColumn
          posts={showMoreButton ? tabPosts.slice(0, POSTS_PER_PAGE) : tabPosts}
          showMoreButton={showMoreButton && tabPosts.length > POSTS_PER_PAGE}
          moreUrl={`posts/${tabIndex === 0 ? '' : currentTab}`}
        />
      </div>
    </div>
  );
}

export default PostTabs;
