const { createFilePath } = require(`gatsby-source-filesystem`);
const { FIXED_CATEGORIES } = require(`./src/utils/categories`);

// subtitle은 최근에 추가된 프론트매터 필드라 기존 글에는 값이 없을 수 있다.
// 스키마를 명시적으로 선언해두지 않으면 subtitle이 없는 글만 있을 때
// GraphQL 쿼리에서 필드 자체를 찾지 못하는 문제가 생길 수 있어 직접 타입을 지정한다.
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter
    }
    type MarkdownRemarkFrontmatter {
      title: String
      subtitle: String
      date: Date @dateformat
      emoji: String
      author: String
      tags: String
      categories: String
    }
  `);
};

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `content` });
    createNodeField({ node, name: `slug`, value: slug });
  }
};

const createBlogPages = ({ createPage, results }) => {
  const blogPostTemplate = require.resolve(`./src/templates/blog-template.js`);
  results.data.allMarkdownRemark.edges.forEach(({ node, next, previous }) => {
    createPage({
      path: node.fields.slug,
      component: blogPostTemplate,
      context: {
        // additional data can be passed via context
        slug: node.fields.slug,
        nextSlug: next?.fields.slug ?? '',
        prevSlug: previous?.fields.slug ?? '',
      },
    });
  });
};

const createPostsPages = ({ createPage, results }) => {
  const categoryTemplate = require.resolve(`./src/templates/category-template.js`);
  // 글 유무와 관계없이 항상 노출할 고정 카테고리
  const categorySet = new Set(FIXED_CATEGORIES);
  const { edges } = results.data.allMarkdownRemark;

  edges.forEach(({ node }) => {
    const postCategories = node.frontmatter.categories.split(' ');
    postCategories.forEach((category) => categorySet.add(category));
  });

  const categories = [...categorySet];

  createPage({
    path: `/posts`,
    component: categoryTemplate,
    context: { currentCategory: 'All', edges, categories },
  });

  categories.forEach((currentCategory) => {
    createPage({
      path: `/posts/${currentCategory}`,
      component: categoryTemplate,
      context: {
        currentCategory,
        categories,
        // 사이드바에서 전체 카테고리/태그 카운트를 보여줘야 하므로
        // 이 페이지의 카테고리로 미리 필터링하지 않고 전체 글 목록을 전달한다.
        // 실제 화면에 보여줄 글 목록 필터링은 PostTabs 컴포넌트에서 처리한다.
        edges,
      },
    });
  });
};

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;

  const results = await graphql(`
    {
      allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }, limit: 1000) {
        edges {
          node {
            id
            html
            excerpt(pruneLength: 500, truncate: true)
            fields {
              slug
            }
            frontmatter {
              categories
              title
              subtitle
              tags
              date(formatString: "MMMM DD, YYYY")
            }
          }
          next {
            fields {
              slug
            }
          }
          previous {
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  // Handle errors
  if (results.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  createBlogPages({ createPage, results });
  createPostsPages({ createPage, results });
};
