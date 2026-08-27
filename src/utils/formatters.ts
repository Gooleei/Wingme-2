/**
 * Formatting utilities for numbers, currencies, and points.
 * 
 * Rules:
 * - Below 1,000: exact format (e.g., $672.07, ₮44.78)
 * - Thousands (1,000 - 999,999): '000' notation with commas (e.g., 90,000 or $90,000.00)
 * - Millions (1,000,000 - 999,999,999): 'M' notation (e.g., 9M, $25M, ₮1.67M)
 * - Billions (1,000,000,000+): 'B' notation (e.g., 9B, $9B, ₮1.5B)
 */

export function formatCompactFigure(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const abs = Math.abs(num);

  if (abs >= 1_000_000_000) {
    const b = num / 1_000_000_000;
    const formatted = b % 1 === 0 ? b.toFixed(0) : b.toFixed(b >= 100 ? 0 : b >= 10 ? 1 : 2).replace(/\.?0+$/, '');
    return `${formatted}B`;
  }

  if (abs >= 1_000_000) {
    const m = num / 1_000_000;
    const formatted = m % 1 === 0 ? m.toFixed(0) : m.toFixed(m >= 100 ? 0 : m >= 10 ? 1 : 2).replace(/\.?0+$/, '');
    return `${formatted}M`;
  }

  if (abs >= 1_000) {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formats dollar currency:
 * - < 1,000: $672.07
 * - 1,000 to 999,999: $90,000.00
 * - 1,000,000+: $25M (or $9M, $1.5M)
 * - 1,000,000,000+: $9B
 */
export function formatCurrency(dollars: number, prefix: string = '$'): string {
  if (dollars === null || dollars === undefined || isNaN(dollars)) return `${prefix}0.00`;
  const abs = Math.abs(dollars);

  if (abs >= 1_000_000_000) {
    return `${prefix}${formatCompactFigure(dollars)}`;
  }
  if (abs >= 1_000_000) {
    return `${prefix}${formatCompactFigure(dollars)}`;
  }
  if (abs >= 1_000) {
    return `${prefix}${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${prefix}${dollars.toFixed(2)}`;
}

/**
 * Formats points:
 * - < 1,000: ₮44.78
 * - 1,000 to 999,999: ₮90,000.00
 * - 1,000,000+: ₮1.67M (or ₮25M)
 * - 1,000,000,000+: ₮9B
 */
export function formatPoints(points: number, prefix: string = '₮'): string {
  if (points === null || points === undefined || isNaN(points)) return `${prefix}0.00`;
  const abs = Math.abs(points);

  if (abs >= 1_000_000_000) {
    return `${prefix}${formatCompactFigure(points)}`;
  }
  if (abs >= 1_000_000) {
    return `${prefix}${formatCompactFigure(points)}`;
  }
  if (abs >= 1_000) {
    return `${prefix}${points.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${prefix}${points.toFixed(2)}`;
}

/**
 * Formats raw counts (e.g. diamonds, taps, steps):
 * - < 1,000: 0, 450
 * - 1,000 to 999,999: 90,000
 * - 1,000,000+: 9M, 25M
 * - 1,000,000,000+: 9B
 */
export function formatCount(count: number): string {
  return formatCompactFigure(count);
}
