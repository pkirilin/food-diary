import React from 'react';
import './SidebarListLoader.scss';
import Loader from '../../Loader';

interface SidebarListLoaderProps {
  label?: string;
}

const SidebarListLoader: React.FC<SidebarListLoaderProps> = ({ label }: SidebarListLoaderProps) => {
  return (
    <div className="sidebar-list-loader">
      <Loader label={label}></Loader>
    </div>
  );
};

export default SidebarListLoader;
