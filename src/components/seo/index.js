import { useStaticQuery, graphql } from 'gatsby';
import React from 'react';
import { Helmet } from 'react-helmet';

// pathname, isArticle, datePublished, author, image를 넘기면
// 글 단위 canonical/OG/JSON-LD(Article)까지 채워진다.
// 별도로 넘기지 않으면 사이트 기본값으로 채워지므로 기존 <Seo title="..." /> 호출부는 그대로 동작한다.
function Seo({ title, description, pathname, isArticle, datePublished, author, image }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            siteUrl
            author {
              name
            }
            ogImage
            verification {
              google
              naver
            }
          }
        }
      }
    `,
  );

  const { siteUrl, ogImage, title: siteTitle, author: siteAuthor, verification } = site.siteMetadata;
  const metaDescription = description || site.siteMetadata.description;
  const authorName = author || siteAuthor.name;
  const canonicalUrl = pathname ? `${siteUrl}${pathname}` : siteUrl;
  const metaImage = (image || ogImage).startsWith('http')
    ? image || ogImage
    : `${siteUrl}${image || ogImage}`;

  const jsonLd = isArticle
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: metaDescription,
        image: metaImage,
        author: {
          '@type': 'Person',
          name: authorName,
        },
        publisher: {
          '@type': 'Organization',
          name: siteTitle,
        },
        ...(datePublished ? { datePublished } : {}),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      }
    : null;

  return (
    <Helmet
      htmlAttributes={{ lang: 'ko' }}
      title={title}
      defaultTitle={siteTitle}
      titleTemplate={`%s | ${siteTitle}`}
    >
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={metaDescription} />
      {verification?.google && (
        <meta name="google-site-verification" content={verification.google} />
      )}
      {verification?.naver && <meta name="naver-site-verification" content={verification.naver} />}

      <meta property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:author" content={authorName} />
      {isArticle && datePublished && (
        <meta property="article:published_time" content={datePublished} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}

export default Seo;
