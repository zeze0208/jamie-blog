import React from 'react';
import { Link } from 'gatsby';
import './style.scss';

// title/subtitle은 alt 텍스트 용도로만 사용하고, 배너 위 텍스트 오버레이는 노출하지 않음
// 배너를 클릭하면 홈으로 이동한다
function MainBanner({ image, title, subtitle }) {
  return (
    <Link
      to="/"
      className="main-banner"
      role="img"
      aria-label={[title, subtitle].filter(Boolean).join(' - ')}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    />
  );
}

export default MainBanner;
