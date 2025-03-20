
import React from 'react';

const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
  );
};

export default LoadingAnimation;
