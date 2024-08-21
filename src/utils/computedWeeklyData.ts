import { IDataPoint } from '@/types/types'

export function getMonthYear (date: string): string {
  const currentDate = new Date(date)
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  const year = currentDate.getFullYear()
  return `${year}-${month}`
}

export function calculateWeeklyAverages (data: IDataPoint[]): IDataPoint[] {
  const monthlyTotals: Record<string, number> = {}
  const monthlyCounts: Record<string, number> = {}

  for (const entry of data) {
    const monthYear = getMonthYear(entry.date)
    if (!monthlyTotals[monthYear]) {
      monthlyTotals[monthYear] = 0
      monthlyCounts[monthYear] = 0
    }
    monthlyTotals[monthYear] += entry.price
    monthlyCounts[monthYear] += 1
  }

  return Object.entries(monthlyTotals).map(([monthYear, total]) => ({
    date: monthYear,
    price: total / monthlyCounts[monthYear],
    current: 0,
    difference: 0,
    max: 0,
    min: 0,
  }))
}
