import React from 'react';
import './Preloader.scss';
import Loader, { LoaderProps } from '../Loader';

interface PreloaderProps extends LoaderProps {
  isVisible?: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({
  children,
  isVisible = false,
  ...loaderProps
}: React.PropsWithChildren<PreloaderProps>) => {
  return (
    <div className="preloader">
      {isVisible && (
        <div className="preloader__loader">
          <Loader {...loaderProps}></Loader>
        </div>
      )}
      {children}
    </div>
  );
};

export default Preloader;
