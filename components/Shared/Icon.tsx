
import React from 'react';
import * as Lucide from 'lucide-react';

interface IconProps {
  name: keyof typeof Lucide;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size = 20 }) => {
  const LucideIcon = Lucide[name] as React.ElementType;
  return <LucideIcon className={className} size={size} />;
};
