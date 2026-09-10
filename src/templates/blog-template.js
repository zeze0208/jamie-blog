import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../layout';
import Seo from '../components/seo';
import MainBanner from '../components/main-banner';
import PostHeader from '../components/post-header';
import PostNavigator from '../components/post-navigator';
import PostSidebar from '../components/post-sidebar';
import Post from '../models/post';
import PostContent from '../components/post-content';
import Utterances from '../components/utterances';
import { getRelatedPosts } from '../utils/helpers';

function BlogTemplate({ data }) {
  const curPost = new Post(data.cur);
  const allPosts = data.all.edges.map(({ node }) => new Post(node));
  const relatedPosts = getRelatedPosts(curPost, allPosts, 4);
  const { comments } = data.site?.siteMetadata;
  const utterancesRepo = comments?.utterances?.repo;

  return (
    <Layout wide>
      <Seo
        title={curPost?.title}
        description={curPost?.excerpt}
        pathname={curPost?.slug}
        image={curPost?.thumbnail}
        isArticle
        datePublished={data.cur?.frontmatter?.isoDate}
        author={curPost?.author}
      />
      <MainBanner image="/jaime-main-banner.jpg" title={curPost?.title} />
      {/* has-toc: 우측 고정 목차가 들어설 자리를 미리 비워 본문과 겹치지 않게 함 */}
      <div className="post-tabs-wrapper has-toc">
        <PostSidebar posts={allPosts} activeCategories={curPost.categories} />
        <div className="post-tabs-content">
          <div style={{ width: '100%' }}>
            <PostHeader post={curPost} />
            <PostContent html={curPost.html} />
            <PostNavigator posts={relatedPosts} />
            {utterancesRepo && <Utterances repo={utterancesRepo} path={curPost.slug} />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default BlogTemplate;

export const pageQuery = graphql`
  query($slug: String) {
    cur: markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt(pruneLength: 500, truncate: true)
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        isoDate: date(formatString: "YYYY-MM-DD")
        title
        subtitle
        categories
        tags
        author
        emoji
      }
      fields {
        slug
      }
    }

    all: allMarkdownRemark(sort: { fields: frontmatter___date, order: DESC }, limit: 1000) {
      edges {
        node {
          id
          html
          excerpt(pruneLength: 500, truncate: true)
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            subtitle
            categories
            tags
            author
            emoji
          }
          fields {
            slug
          }
        }
      }
    }

    site {
      siteMetadata {
        siteUrl
        comments {
          utterances {
            repo
          }
        }
      }
    }
  }
`;
