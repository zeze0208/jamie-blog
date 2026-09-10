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
    // 2026-09 URL 구조 변경: 글 경로를 jai.me.kr/글슬러그 에서 jai.me.kr/content/글슬러그 로 이동.
    // 기존에 색인·공유된 URL은 static/_redirects 에서 301로 새 경로로 보낸다.
    const slug = createFilePath({ node, getNode, basePath: `content` });
    createNodeField({ node, name: `slug`, value: `/content${slug}` });
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

const createTagPages = ({ createPage, results }) => {
  const tagTemplate = require.resolve(`./src/templates/tag-template.js`);
  const { edges } = results.data.allMarkdownRemark;

  // 글에 달린 모든 태그(쉼표 구분 문자열)를 모아 태그별 페이지를 만든다.
  const tagSet = new Set();
  edges.forEach(({ node }) => {
    (node.frontmatter.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .forEach((tag) => tagSet.add(tag));
  });

  tagSet.forEach((currentTag) => {
    createPage({
      path: `/tags/${currentTag}`,
      component: tagTemplate,
      context: {
        currentTag,
        // 사이드바 카운트를 전체 기준으로 보여주기 위해 전체 글 목록을 전달 (카테고리 페이지와 동일한 방식)
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
  createTagPages({ createPage, results });
};
