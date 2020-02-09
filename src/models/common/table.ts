interface TableKey {
  key: number | string;
}

export interface TableColumn extends TableKey {
  data: string | JSX.Element;
  width?: string | number;
}

export interface TableRow extends TableKey {
  columns: TableColumn[];
}
