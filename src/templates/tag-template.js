import React, { useMemo } from 'react';
import Layout from '../layout';
import Seo from '../components/seo';
import Post from '../models/post';
import MainBanner from '../components/main-banner';
import PostSidebar from '../components/post-sidebar';
import PostCardColumn from '../components/post-card-column';

// /tags/{태그명} 페이지 — 해당 태그가 붙은 글만 필터링해서 보여준다.
// 좌측 사이드바는 카테고리/태그 페이지와 동일하게 전체 글 기준 카운트를 보여주고,
// 현재 보고 있는 태그만 선택 표시한다.
function TagTemplate({ pageContext, location }) {
  const { edges, currentTag } = pageContext;

  const allPosts = useMemo(() => edges.map(({ node }) => new Post(node)), [edges]);
  const posts = useMemo(
    () => allPosts.filter((post) => post.tags.includes(currentTag)),
    [allPosts, currentTag],
  );

  return (
    <Layout wide>
      <Seo title={`#${currentTag}`} pathname={location?.pathname} />
      <MainBanner image="/jaime-main-banner.jpg" title={`#${currentTag}`} />
      <div className="post-tabs-wrapper">
        <PostSidebar posts={allPosts} activeTags={[currentTag]} />
        <div className="post-tabs-content">
          <PostCardColumn posts={posts} />
        </div>
      </div>
    </Layout>
  );
}

export default TagTemplate;
