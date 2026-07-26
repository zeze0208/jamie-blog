import React from 'react';
import './style.scss';

function MainBanner({ image, title, subtitle }) {
  return (
    <div
      className="main-banner"
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className="main-banner-overlay">
        {title && <div className="main-banner-title">{title}</div>}
        {subtitle && <div className="main-banner-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export default MainBanner;
