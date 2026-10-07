// Browsers read a leading `//` or `/\` as a URL on another host
const IN_APP_PATH = /^\/(?![/\\])/;

export const getInAppReturnUrl = (searchParams: URLSearchParams): string => {
  const returnUrl = searchParams.get('returnUrl');
  return returnUrl !== null && IN_APP_PATH.test(returnUrl) ? returnUrl : '/';
};
