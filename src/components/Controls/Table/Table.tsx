import React from 'react';
import './Table.scss';
import { TableColumn, TableRow } from '../../../models';
import Loader from '../../Loader';

interface TableProps {
  headers: TableColumn[];
  rows?: TableRow[];
  noDataMessage?: string;
  dataLoadingMessage?: string;
  isDataLoading?: boolean;
  isDataLoaded?: boolean;
}

const Table: React.FC<TableProps> = ({
  headers,
  rows = [],
  noDataMessage = 'No data provided',
  dataLoadingMessage = 'Loading table data',
  isDataLoading = false,
  isDataLoaded = true,
}: TableProps) => {
  return (
    <table className="table">
      <thead className="table__head">
        <tr className="table__head__row">
          {headers.map(col => (
            <td key={col.key} className="table__head__row__col" style={col.width ? { width: col.width } : {}}>
              {col.data}
            </td>
          ))}
        </tr>
      </thead>
      <tbody className="table__body">
        {isDataLoading ? (
          <tr className="table__body__row">
            <td colSpan={headers.length} className="table__body__row__col table__body__row__col_empty">
              <Loader size="small" label={dataLoadingMessage}></Loader>
            </td>
          </tr>
        ) : rows.length === 0 || !isDataLoaded ? (
          <tr className="table__body__row">
            <td colSpan={headers.length} className="table__body__row__col table__body__row__col_empty">
              {noDataMessage}
            </td>
          </tr>
        ) : (
          rows.map(row => (
            <tr key={row.key} className="table__body__row">
              {row.columns.map(col => (
                <td key={col.key} className="table__body__row__col" style={col.width ? { width: col.width } : {}}>
                  {col.data}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default Table;
