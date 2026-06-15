import React, { useMemo } from 'react';
import { Tabs, Tab } from '@mui/material';
import PostCardColumn from '../post-card-column';
import './style.scss';

const CATEGORY_LABELS = {
  All: '전체',
  insight: '기획 인사이트',
  oalive: 'OALIVE 운영',
  'vibe-coding': '바이브코딩',
  industry: '업계 트렌드',
  life: '일상/생각',
  featured: 'FEATURED',
};

function PostTabs({ tabIndex, onChange, tabs, posts, showMoreButton }) {
  const tabPosts = useMemo(() => {
    if (tabs[tabIndex] === 'All') return posts;
    return posts.filter((post) => post.categories.includes(tabs[tabIndex]));
  }, [posts, tabs, tabIndex]);

  return (
    <div className="post-tabs-wrapper">
      <div className="post-tabs">
        <Tabs
          className="mui-tabs"
          value={tabIndex}
          onChange={onChange}
          variant="scrollable"
          scrollButtons="desktop"
        >
          {tabs.map((title, index) => (
            <Tab label={CATEGORY_LABELS[title] || title} key={index} />
          ))}
        </Tabs>
      </div>
      <PostCardColumn
        posts={showMoreButton ? tabPosts.slice(0, 4) : tabPosts}
        showMoreButton={showMoreButton && tabPosts.length > 4}
        moreUrl={`posts/${tabIndex === 0 ? '' : tabs[tabIndex]}`}
      />
    </div>
  );
}
export default PostTabs;
