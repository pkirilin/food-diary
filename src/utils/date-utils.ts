export enum DateFormat {
  SlashDMY,
  DashYMD,
}

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

export function formatDate(date: Date, format: DateFormat): string {
  const [day, month, year] = parseDateComponents(date);
  switch (format) {
    case DateFormat.SlashDMY:
      return `${day}/${month}/${year}`;
    case DateFormat.DashYMD:
      return `${year}-${month}-${day}`;
  }
}

export function formatDateStr(date: string, format: DateFormat): string {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    // Date string had invalid format
    console.error(`Date '${date}' cannot be formatted`);
    return 'Unknown date';
  }

  return formatDate(parsedDate, format);
}

export function isDateStringValid(dateString: string): boolean {
  return !isNaN(Date.parse(dateString));
}
