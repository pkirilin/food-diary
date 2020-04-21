export const getFormattedDate = (dateStr: string): string => {
  const parsedDate = new Date(dateStr);

  if (isNaN(parsedDate.getTime())) {
    // Date string had invalid format
    console.error(`Date '${dateStr}' cannot be formatted`);
    return 'Unknown date';
  }

  let dayStr = parsedDate.getDate().toString();
  if (+dayStr < 10) {
    dayStr = '0' + dayStr;
  }

  let monthStr = (parsedDate.getMonth() + 1).toString();
  if (+monthStr < 10) {
    monthStr = '0' + monthStr;
  }

  let yearStr = parsedDate.getFullYear().toString();
  if (+yearStr < 10) {
    yearStr = '0' + yearStr;
  }

  return `${dayStr}/${monthStr}/${yearStr}`;
};

export const isDateStringValid = (dateString: string): boolean => {
  return !isNaN(Date.parse(dateString));
};
