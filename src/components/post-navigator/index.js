import { Link } from 'gatsby';
import React from 'react';
import { CATEGORY_LABELS } from '../../utils/categories';
import './style.scss';

function PostNavigator({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="post-navigator-wrapper">
      <div className="post-navigator-header">More from 생각하는 감자</div>
      <div className="post-navigator-grid">
        {posts.map((post) => (
          <Link className="post-navigator-card" key={post.id} to={post.slug}>
            <div className="post-navigator-thumbnail">
              <img src={post.thumbnail} alt="" loading="lazy" />
            </div>
            <div className="post-navigator-body">
              <div className="category-label">
                {post.categories.map((category) => CATEGORY_LABELS[category] || category).join(' · ')}
              </div>
              <div className="title">{post.title}</div>
              {post.subtitle && <div className="subtitle">{post.subtitle}</div>}
              <div className="date">{post.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PostNavigator;
