import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import PageHeader from '../components/page-header';
import PageFooter from '../components/page-footer';
import ThemeSwitch from '../components/theme-switch';
import MainBanner from '../components/main-banner';
import './style.scss';

const Layout = ({ children, wide }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          mainBanner {
            image
            title
            subtitle
          }
          author {
            name
            social {
              github
            }
          }
        }
      }
    }
  `);
  const { title, author, mainBanner } = data.site.siteMetadata;

  return (
    <div className="page-wrapper">
      <PageHeader siteTitle={title || `Title`} />
      {mainBanner && (
        <div className="page-banner-area">
          <MainBanner
            image={mainBanner.image}
            title={mainBanner.title}
            subtitle={mainBanner.subtitle}
          />
        </div>
      )}
      <main className={`page-content ${wide ? 'wide' : ''}`}>{children}</main>
      <PageFooter
        author={author.name || `Author`}
        githubUrl={author.social?.github || `https://www.github.com`}
      />
      <ThemeSwitch />
    </div>
  );
};

export default Layout;
