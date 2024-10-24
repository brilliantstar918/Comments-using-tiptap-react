import React from 'react';

interface AvatarProps {
  url: string;
  alt: string;
}

export const Avatar: React.FC<AvatarProps> = ({ url, alt }) => (
  <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
    <img src={url} alt={alt} className="w-full h-full object-cover" />
  </div>
);