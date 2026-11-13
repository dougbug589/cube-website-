// Turns a line such as "Plot coverage over 10,000 Acres" or "Value of over
// Rs. 25000 Cr" into { lead, prefix, value, unit } so it can be shown as a
// large figure. Lines without a number return null (shown as plain text).
export type Figure = { lead: string; prefix: string; value: number; unit: string; decimals: number };

export const parseFigure = (line: string): Figure | null => {
  const m = line.match(/^(.*?)\s*(Rs\.?\s*)?([\d,]+(?:\.\d+)?)\s*(.*)$/i);
  if (!m) return null;
  const raw = m[3].replace(/,/g, '');
  return {
    lead: m[1].trim(),
    prefix: m[2] ? 'Rs.' : '',
    value: Number(raw),
    unit: m[4].trim(),
    decimals: raw.includes('.') ? raw.split('.')[1].length : 0,
  };
};

export const fmtFigure = (n: number, d: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
