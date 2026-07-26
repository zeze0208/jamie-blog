import React, { useCallback, useState } from 'react';
import { graphql } from 'gatsby';
import Layout from '../layout';
import Seo from '../components/seo';
// import Bio from '../components/bio'; // 홈 화면에서 숨김 처리 — 복원하려면 주석 해제 후 아래 <Bio> 태그도 주석 해제
import Post from '../models/post';

import PostTabs from '../components/post-tabs';
import { FIXED_CATEGORIES } from '../utils/categories';

function HomePage({ data }) {
  const posts = data.allMarkdownRemark.edges.map(({ node }) => new Post(node));

  const categories = FIXED_CATEGORIES;
  const allTabIndex = categories.findIndex((category) => category === 'All');
  const [tabIndex, setTabIndex] = useState(allTabIndex === -1 ? 0 : allTabIndex);
  const onTabIndexChange = useCallback((e, value) => setTabIndex(value), []);

  return (
    <Layout wide>
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
          html
          excerpt(pruneLength: 500, truncate: true)
          frontmatter {
            categories
            title
            tags
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
