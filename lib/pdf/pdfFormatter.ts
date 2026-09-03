export function money(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value);
}

export function date(value: string | Date) {
  return new Date(value).toLocaleDateString(
    "en-ZA"
  );
}