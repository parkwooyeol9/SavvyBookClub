import type { Book } from "@/lib/books/types";

export type ChartPeriod = "daily" | "weekly" | "monthly";

export interface ChartedBooks {
  daily: Book[];
  weekly: Book[];
  monthly: Book[];
}

export const chartPeriodLabels: Record<ChartPeriod, string> = {
  daily: "일간",
  weekly: "주간",
  monthly: "월간",
};

export const chartPeriodDescriptions: Record<ChartPeriod, string> = {
  daily: "어제·전일 판매 기준",
  weekly: "최근 7일 판매 기준",
  monthly: "월별 판매 기준",
};

export function emptyChartedBooks(): ChartedBooks {
  return { daily: [], weekly: [], monthly: [] };
}

/** Backward-compat: old cache stored a flat Book[]. */
export function normalizeChartedBooks(value: Book[] | ChartedBooks): ChartedBooks {
  if (Array.isArray(value)) {
    return { daily: [], weekly: value, monthly: [] };
  }
  return {
    daily: value.daily ?? [],
    weekly: value.weekly ?? [],
    monthly: value.monthly ?? [],
  };
}

export function pickChartBooks(
  charted: ChartedBooks,
  period: ChartPeriod,
): Book[] {
  const books = charted[period];
  if (books.length > 0) return books;
  if (period !== "weekly" && charted.weekly.length > 0) return charted.weekly;
  for (const fallback of ["daily", "monthly", "weekly"] as ChartPeriod[]) {
    if (charted[fallback].length > 0) return charted[fallback];
  }
  return [];
}
