import React from 'react';
import './Loader.scss';
import { ReactComponent as LoaderSvg } from './loader.svg';

export interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', label }: LoaderProps) => {
  const loaderClassNames = ['loader-container__loader', `loader-container__loader_${size}`];
  const labelClassNames = ['loader-container__label', `loader-container__label_${size}`];
  return (
    <div className="loader-container">
      <LoaderSvg className={loaderClassNames.join(' ')}></LoaderSvg>
      {label && <div className={labelClassNames.join(' ')}>{label}</div>}
    </div>
  );
};

export default Loader;
