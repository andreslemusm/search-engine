const numberFormatter = new Intl.NumberFormat("en", { notation: "compact" });
const formatNumberAsCompactNumber = (value: number) =>
  numberFormatter.format(value);

export { formatNumberAsCompactNumber };
