import React from 'react';

interface TableColumnProps {
  name: string;
  width?: string | number;
}

const TableColumn: React.FC<TableColumnProps> = ({ name, width }: TableColumnProps) => {
  return (
    <td
      style={
        width
          ? {
              width,
            }
          : {}
      }
    >
      {name}
    </td>
  );
};

export default TableColumn;
