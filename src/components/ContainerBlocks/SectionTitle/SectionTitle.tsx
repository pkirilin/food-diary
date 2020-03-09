import React from 'react';
import './SectionTitle.scss';

interface SectionTitleProps {
  title?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title = '' }: SectionTitleProps) => {
  return <div className="section-title">{title}</div>;
};

export default SectionTitle;
