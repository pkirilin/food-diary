export interface TableColumn {
  name: string;
  width?: string | number;
}

export type TableData = {
  content: JSX.Element | string | number;
};
