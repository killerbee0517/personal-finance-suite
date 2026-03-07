export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

export const formatNumber = (value: number): string => new Intl.NumberFormat("en-IN").format(value || 0);
