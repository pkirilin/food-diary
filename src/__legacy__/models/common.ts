export enum SortOrder {
  Ascending = 0,
  Descending = 1,
}

export enum ExportFormat {
  Json = 'json',
  Pdf = 'pdf',
}

export interface BadRequestResponse {
  errors: Map<string, Array<string>>;
}