export enum ShowCount {
  LastWeek = 7,
  LastMonth = 30,
  LastTwoMonths = 60,
  LastThreeMonths = 90,
  LastHalfYear = 120,
  LastYear = 365,
  AllTime = 0,
}

export enum SortOrder {
  Ascending = 0,
  Descending = 1,
}

export interface BadRequestResponse {
  errors: Map<string, Array<string>>;
}
