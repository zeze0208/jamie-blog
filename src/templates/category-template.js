import React, { useMemo, useCallback } from 'react';
import { navigate } from 'gatsby';

import Layout from '../layout';
import Seo from '../components/seo';
import Post from '../models/post';
import CategoryPageHeader from '../components/category-page-header';
import PostTabs, { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '../components/post-tabs';

function CategoryTemplate({ pageContext }) {
  const { edges, currentCategory } = pageContext;
  const { categories } = pageContext;
  const currentTabIndex = useMemo(
    () => categories.findIndex((category) => category === currentCategory),
    [categories, currentCategory],
  );
  const posts = edges.map(({ node }) => new Post(node));

  const onTabIndexChange = useCallback(
    (e, value) => {
      if (value === 0) return navigate(`/posts`);
      navigate(`/posts/${categories[value]}`);
    },
    [categories],
  );

  const title = CATEGORY_LABELS[currentCategory] || currentCategory;
  const description = CATEGORY_DESCRIPTIONS[currentCategory];

  return (
    <Layout>
      <Seo title="Posts" />
      <CategoryPageHeader
        title={title}
        subtitle={description || `${posts.length} posts`}
      />
      {description && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary-color, #888)', marginBottom: '8px', fontSize: '0.95rem' }}>
          {posts.length} posts
        </p>
      )}
      <PostTabs
        tabIndex={currentTabIndex}
        onChange={onTabIndexChange}
        tabs={categories}
        posts={posts}
      />
    </Layout>
  );
}

export default CategoryTemplate;
