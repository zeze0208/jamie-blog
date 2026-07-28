import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../layout';
import Seo from '../components/seo';
import PostHeader from '../components/post-header';
import PostNavigator from '../components/post-navigator';
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
    <Layout>
      <Seo
        title={curPost?.title}
        description={curPost?.excerpt}
        pathname={curPost?.slug}
        image={curPost?.thumbnail}
        isArticle
        datePublished={data.cur?.frontmatter?.isoDate}
        author={curPost?.author}
      />
      <PostHeader post={curPost} />
      <PostContent html={curPost.html} />
      <PostNavigator posts={relatedPosts} />
      {utterancesRepo && <Utterances repo={utterancesRepo} path={curPost.slug} />}
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
