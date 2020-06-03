/**
 * Represents date format for conversion
 */
export enum DateFormat {
  /**
   * dd/MM/yyyy, e.g. 03/06/2020
   */
  SlashDMY,

  /**
   * yyyy-MM-dd, e.g. 2020-06-03
   */
  DashYMD,
}

/**
 * Reads day, month and year from target date
 * @param date Target date
 */
function parseDateComponents(date: Date): [string, string, string] {
  let dayStr = date.getDate().toString();
  if (+dayStr < 10) {
    dayStr = '0' + dayStr;
  }

  let monthStr = (date.getMonth() + 1).toString();
  if (+monthStr < 10) {
    monthStr = '0' + monthStr;
  }

  let yearStr = date.getFullYear().toString();
  if (+yearStr < 10) {
    yearStr = '0' + yearStr;
  }

  return [dayStr, monthStr, yearStr];
}

/**
 * Converts target date to the string of specified date format
 * @param date Target date
 * @param format Date format
 */
export function formatDate(date: Date, format: DateFormat): string {
  const [day, month, year] = parseDateComponents(date);
  switch (format) {
    case DateFormat.SlashDMY:
      return `${day}/${month}/${year}`;
    case DateFormat.DashYMD:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Converts string representation of date to the string of specified date format
 * @param date String representation of date
 * @param format Date format
 */
export function formatDateStr(date: string, format: DateFormat): string {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    // Date string had invalid format
    console.error(`Date '${date}' cannot be formatted`);
    return 'Unknown date';
  }

  return formatDate(parsedDate, format);
}

/**
 * Checks if string representation of date is valid
 * @param dateString String representation of date
 */
export function isDateStringValid(dateString: string): boolean {
  return !isNaN(Date.parse(dateString));
}
