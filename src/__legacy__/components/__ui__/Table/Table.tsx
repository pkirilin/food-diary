import React, { ReactElement } from 'react';
import './Table.scss';

interface TableProps<C extends JSX.Element, R extends JSX.Element> {
  columns: C[];
  rows?: R[];
  noDataMessage?: string;
  dataErrorMessage?: string;
  isCondensed?: boolean;
}

function Table<C extends JSX.Element, R extends JSX.Element>({
  columns,
  rows = [],
  noDataMessage = 'No data provided',
  dataErrorMessage,
  isCondensed = false,
}: TableProps<C, R>): ReactElement {
  const classNames = ['table'];

  if (isCondensed) classNames.push('table_condensed');

  return (
    <table className={classNames.join(' ')}>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <React.Fragment key={index}>{col}</React.Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataErrorMessage ? (
          <tr>
            <td className="empty" colSpan={columns.length}>
              {dataErrorMessage}
            </td>
          </tr>
        ) : (
          <React.Fragment>
            {rows && rows.map((row, index) => <React.Fragment key={index}>{row}</React.Fragment>)}
            {rows.length === 0 && (
              <tr>
                <td className="empty" colSpan={columns.length}>
                  {noDataMessage}
                </td>
              </tr>
            )}
          </React.Fragment>
        )}
      </tbody>
    </table>
  );
}

export default Table;
