import React, { ReactElement } from 'react';
import './Table.scss';

interface TableProps<C extends JSX.Element, R extends JSX.Element> {
  columns: C[];
  rows?: R[];
  noDataMessage?: string;
}

function Table<C extends JSX.Element, R extends JSX.Element>({
  columns,
  rows = [],
  noDataMessage = 'No data provided',
}: TableProps<C, R>): ReactElement {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <React.Fragment key={index}>{col}</React.Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows && rows.map((row, index) => <React.Fragment key={index}>{row}</React.Fragment>)}
        {rows.length === 0 && (
          <tr>
            <td className="empty" colSpan={columns.length}>
              {noDataMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default Table;
