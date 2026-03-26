export function formatTime(value: string): string | undefined {
  if (!value) return undefined;
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-");
  const time = timePart.length === 5 ? timePart + ":00" : timePart;
  return `${year}-${month}-${day} ${time}`;
}
