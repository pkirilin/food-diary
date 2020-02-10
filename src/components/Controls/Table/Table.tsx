import React from 'react';
import './Table.scss';
import { TableColumn, TableData } from '../../../models';

interface TableProps {
  columns: TableColumn[];
  data?: TableData[][];
  noDataMessage?: string;
}

const Table: React.FC<TableProps> = ({ columns, data = [], noDataMessage = 'No data provided' }: TableProps) => {
  return (
    <table className="table">
      <thead className="table__head">
        <tr className="table__head__row">
          {columns.map((col, index) => (
            <td key={index} className="table__head__row__col" style={col.width ? { width: col.width } : {}}>
              {col.name}
            </td>
          ))}
        </tr>
      </thead>
      <tbody className="table__body">
        {data &&
          data.map((rowColumns, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="table__body__row">
              {rowColumns &&
                rowColumns.map((col, colIndex) => (
                  <td key={`col-${colIndex}`} className="table__body__row__col">
                    {col.content}
                  </td>
                ))}
            </tr>
          ))}

        {data.length === 0 && (
          <tr className="table__body__row">
            <td className="table__body__row__col table__body__row__col_empty" colSpan={columns.length}>
              {noDataMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;
