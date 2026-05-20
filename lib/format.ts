/**
 * Utility functions for formatting numbers, currency, and percentages in the Indonesian locale.
 */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(2).replace(".", ",")} Miliar`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(2).replace(".", ",")} Juta`;
  }
  return formatCurrency(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatPercent(value: number): string {
  // If the percentage value is already a decimal representation (like 0.0543 for 5.43%)
  // or a whole number (like 5.43 for 5.43%), we standardize it.
  // The consolidated script writes percentages as decimals (e.g. 0.0543)
  const percentVal = value * 100;
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percentVal) + "%";
}

export function formatGrowth(value: number): string {
  const percentVal = value * 100;
  const sign = value > 0 ? "+" : "";
  return sign + new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percentVal) + "%";
}
