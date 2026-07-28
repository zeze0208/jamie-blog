import { Link } from 'gatsby';
import React from 'react';
import { CATEGORY_LABELS } from '../../utils/categories';
import './style.scss';

function PostHeader({ post }) {
  return (
    <header className="post-header">
      {post.emoji && <div className="emoji">{post.emoji}</div>}
      <div className="info">
        <div className="categories">
          {post.categories.map((category) => (
            <Link className="category" key={category} to={`/posts/${category}`}>
              {CATEGORY_LABELS[category] || category}
            </Link>
          ))}
        </div>
      </div>

      <h1 className="title">{post.title}</h1>
      <div className="info">
        <div className="author">
          posted by <strong>{post.author}</strong>,
        </div>{' '}
        {post.date}
      </div>
      {post.tags?.length > 0 && (
        <div className="tags">
          {post.tags.map((tag) => (
            <span className="tag-badge" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
export default PostHeader;
