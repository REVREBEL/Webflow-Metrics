import React from 'react';

interface FoundationIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FoundationIcon({ name, className = '', style = {} }: FoundationIconProps) {
  return (
    <i 
      className={`fi ${name} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
