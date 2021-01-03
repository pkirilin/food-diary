export type UrlParameter = string | number | null | undefined;

export function createUrl(base: string, params: Record<string, UrlParameter>): string {
  let url = base;
  let symbolBeforeParameter = '?';

  for (const paramKey in params) {
    const paramValue = params[paramKey];
    if (paramValue !== undefined && paramValue !== null) {
      url = url.concat(`${symbolBeforeParameter}${paramKey}=${paramValue}`);
      symbolBeforeParameter = '&';
    }
  }

  return encodeURI(url);
}
