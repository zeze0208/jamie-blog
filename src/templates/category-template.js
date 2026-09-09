import React, { useMemo, useCallback } from 'react';
import { navigate } from 'gatsby';

import Layout from '../layout';
import Seo from '../components/seo';
import Post from '../models/post';
import MainBanner from '../components/main-banner';
import PostTabs from '../components/post-tabs';
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '../utils/categories';

function CategoryTemplate({ pageContext, location }) {
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
    <Layout wide>
      <Seo title="Posts" pathname={location?.pathname} />
      <MainBanner image="/jaime-main-banner.jpg" title={title} />
      {description && (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-secondary-color, #888)',
            marginBottom: '8px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
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
