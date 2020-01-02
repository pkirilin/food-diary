import React from 'react';
import './Badge.scss';

interface BadgeProps {
  label: string;
  selected?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ label, selected = false }: BadgeProps) => {
  const classNames = ['fd-badge'];
  if (selected) {
    classNames.push('fd-badge-selected');
  }

  return <div className={classNames.join(' ')}>{label}</div>;
};

export default Badge;
