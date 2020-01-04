import React from 'react';

const withFdIconStyles = (
  SvgComponent: React.FC<React.SVGProps<SVGSVGElement>>,
): React.FC<React.SVGProps<SVGSVGElement>> => {
  const result = (props: React.SVGProps<SVGSVGElement>): JSX.Element => {
    return <SvgComponent {...props} className="fd-icon"></SvgComponent>;
  };
  return result;
};

export default withFdIconStyles;
