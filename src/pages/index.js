import React, { useCallback, useState } from 'react';
import { graphql } from 'gatsby';
import Layout from '../layout';
import Seo from '../components/seo';
// import Bio from '../components/bio'; // 홈 화면에서 숨김 처리 — 복원하려면 주석 해제 후 아래 <Bio> 태그도 주석 해제
import Post from '../models/post';

import PostTabs from '../components/post-tabs';

// 항상 고정 표시할 카테고리 목록 (글이 없어도 탭 유지)
const FIXED_CATEGORIES = ['All', 'featured', 'trend', 'cto', 'planning', 'etc'];

function HomePage({ data }) {
  const posts = data.allMarkdownRemark.edges.map(({ node }) => new Post(node));

  const categories = FIXED_CATEGORIES;
  const featuredTabIndex = categories.findIndex((category) => category === 'featured');
  const [tabIndex, setTabIndex] = useState(featuredTabIndex === -1 ? 0 : featuredTabIndex);
  const onTabIndexChange = useCallback((e, value) => setTabIndex(value), []);

  return (
    <Layout>
      <Seo title="Home" />
      {/* <Bio author={author} language={language} /> */}
      {/* 홈 화면 프로필 섹션 숨김 처리 — 복원하려면 위 주석 해제 및 import Bio 주석도 해제 */}
      <PostTabs
        posts={posts}
        onChange={onTabIndexChange}
        tabs={categories}
        tabIndex={tabIndex}
        showMoreButton
      />
    </Layout>
  );
}

export default HomePage;

export const pageQuery = graphql`
  query {
    allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }) {
      edges {
        node {
          id
          excerpt(pruneLength: 500, truncate: true)
          frontmatter {
            categories
            title
            date(formatString: "MMMM DD, YYYY")
          }
          fields {
            slug
          }
        }
      }
    }

    site {
      siteMetadata {
        language
        author {
          name
          bio {
            role
            description
            thumbnail
          }
          social {
            github
            linkedIn
            email
          }
        }
      }
    }
  }
`;
