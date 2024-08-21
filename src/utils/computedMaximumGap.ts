import { IDataPoint, IMinMaxMap } from '@/types/types'

export function getMonthDay (dateString: string): string {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${month}-${day}`
}

export function maximumMinimumPices (data: {
  [key: string]: { '4. close': string };
}): IDataPoint[] {
  const monthlyGroups: { [key: string]: number[] } = {}
  const currentYearData: IDataPoint[] = []

  // Step 1: Group data by month-day and collect current year data
  Object.entries(data).forEach(([date, { '4. close': close }]) => {
    const price = parseFloat(close)
    const monthDay = getMonthDay(date)

    if (!monthlyGroups[monthDay]) {
      monthlyGroups[monthDay] = []
    }
    monthlyGroups[monthDay].push(price)

    if (new Date(date).getFullYear() === new Date().getFullYear()) {
      currentYearData.push({
        date,
        price,
        current: price,
        difference: 0,
      })
    }
  })

  // Step 2: Calculate min, max, and difference for each month-day and update 'current' for non-matching years
  const minMaxMapResult: IMinMaxMap = Object.entries(monthlyGroups).reduce(
    (map, [monthDay, values]) => {
      const minValue = Math.min(...values)
      const maxValue = Math.max(...values)
      const difference = Number((maxValue - minValue).toFixed(2))

      const currentMatch = currentYearData.find(dataPoint => getMonthDay(dataPoint.date) === monthDay)

      map[monthDay] = {
        min: minValue,
        max: maxValue,
        difference,
        price: difference,
        current: currentMatch ? currentMatch.price : 0,
      }

      return map
    },
    {} as IMinMaxMap
  )

  // Method to format date
  const formatDate = (value: string) => {
    const date = new Date(value)
    return date.toLocaleDateString('en-ZM', {
      month: 'short',
      day: '2-digit',
    })
  }

  return currentYearData.map(({ date, price }) => {
    const monthDay = getMonthDay(date)
    const minMax = minMaxMapResult[monthDay] || {
      min: 0,
      max: 0,
      difference: 0,
      price: 0,
      current: 0,
    }

    const isCurrentYear = new Date(date).getFullYear() === new Date().getFullYear()
    return {
      date: formatDate(date),
      min: minMax.min,
      max: minMax.max,
      difference: minMax.difference,
      price,
      current: isCurrentYear ? price : 0,
    }
  })
}
