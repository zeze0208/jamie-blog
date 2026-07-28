import { Link } from 'gatsby';
import React from 'react';
import { CATEGORY_LABELS } from '../../utils/categories';
import './style.scss';

function PostCard({ post }) {
  const { id, slug, title, subtitle, excerpt, date, categories, tags, thumbnail } = post;
  return (
    <div className="post-card-wrapper">
      <Link className="post-card" key={id} to={slug}>
        <div className="post-card-body">
          <div className="category-label">
            {categories.map((category) => CATEGORY_LABELS[category] || category).join(' · ')}
          </div>
          <div className="title">{title}</div>
          {subtitle && <div className="subtitle">{subtitle}</div>}
          <p className="description" dangerouslySetInnerHTML={{ __html: excerpt }} />
          {tags?.length > 0 && (
            <div className="tags">
              {tags.slice(0, 4).map((tag) => (
                <span className="tag-badge" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="info">
            <div className="date">{date}</div>
          </div>
        </div>
        <div className="post-card-thumbnail">
          <img src={thumbnail} alt="" loading="lazy" />
        </div>
      </Link>
    </div>
  );
}

export default PostCard;
