import React, { useMemo } from 'react';
import { Link } from 'gatsby';
import { CATEGORY_LABELS } from '../../utils/categories';
import '../post-tabs/style.scss';

// 사이드바에 노출할 태그 최대 개수
const MAX_SIDEBAR_TAGS = 20;

// 글 상세 페이지 좌측에 카테고리/태그 사이드바를 보여준다 (홈 화면의 post-tabs 사이드바와 동일한 스타일을 재사용).
// 홈과 달리 여기서는 클릭 시 실제 카테고리 페이지로 이동한다 (탭 전환 상태가 없음).
function PostSidebar({ posts, activeCategories = [] }) {
  const tabs = useMemo(() => {
    const set = new Set();
    posts.forEach((post) => (post.categories || []).forEach((category) => set.add(category)));
    return ['All', ...Array.from(set)];
  }, [posts]);

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

  return (
    <aside className="post-sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">카테고리</div>
        <ul className="sidebar-list">
          {tabs.map((tab) => (
            <li key={tab}>
              <Link
                className={`sidebar-item ${activeCategories.includes(tab) ? 'selected' : ''}`}
                to={tab === 'All' ? '/' : `/posts/${tab}`}
              >
                <span className="sidebar-item-label">{CATEGORY_LABELS[tab] || tab}</span>
                <span className="sidebar-item-count">{categoryCounts[tab]}</span>
              </Link>
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
  );
}

export default PostSidebar;
