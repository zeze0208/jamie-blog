import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../layout';
import Seo from '../components/seo';
import './about.scss';

function AboutPage({ data }) {
  const metaData = data.site.siteMetadata;
  const { author } = metaData;

  return (
    <Layout>
      <Seo title="About" />
      <div className="about-wrapper">
        <div className="about-header">
          <h1 className="about-name">{author.name}</h1>
          <p className="about-role">Co-Founder &amp; CSO</p>
        </div>

        <div className="about-section">
          <ul className="about-tags">
            <li>경영학 전공</li>
            <li>스타트업 10년차</li>
            <li>사업/전략기획</li>
            <li>IT서비스기획</li>
          </ul>
        </div>

        <div className="about-section">
          <p>
            경영학을 전공하고 1인 창업을 꿈꾸며 일하다가, 합이 잘 맞는 Co-founder들을 만나 어느새 10년째 함께 하는 중.
          </p>
          <p>
            세상을 바꾸는 기획을 하고 싶었던 오프라인 기획자에서, 프로젝트와 사업, IT서비스까지 기획하며 온오프라인을 넘나드는 제너럴 기획자로.
          </p>
          <p>
            CSO로서 회사의 신사업, 자금조달을 위한 기획/제안 업무를 주로 담당하고, 가장 중요하게는 회사의 Snack 조달을 맡고 있음 (a.k.a. 탕요(탕비실요정))
          </p>
          <p>
            대문자 ISTJ, 대표적인 사람싫어 인간이 '좋은 리더'가 되기 위해 고군분투 하는 중.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default AboutPage;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        author {
          name
        }
      }
    }
  }
`;
