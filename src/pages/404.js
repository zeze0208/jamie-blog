import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Layout from '../layout';
import Seo from '../components/seo';
import PostSidebar from '../components/post-sidebar';
import Post from '../models/post';

function NotFoundPage({ location }) {
  const data = useStaticQuery(graphql`
    query NotFoundSidebarQuery {
      allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }, limit: 1000) {
        edges {
          node {
            id
            excerpt(pruneLength: 1)
            frontmatter {
              categories
              tags
            }
            fields {
              slug
            }
          }
        }
      }
    }
  `);
  const posts = data.allMarkdownRemark.edges.map(({ node }) => new Post(node));

  return (
    <Layout wide>
      <Seo title="404: Not found" pathname={location?.pathname} />
      <div className="post-tabs-wrapper">
        <PostSidebar posts={posts} />
        <div className="post-tabs-content">
          <div style={{ width: '100%' }}>
            <h1>404: Not Found</h1>
            <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default NotFoundPage;
