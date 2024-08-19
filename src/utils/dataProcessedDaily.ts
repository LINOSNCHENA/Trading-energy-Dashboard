import { IDataPoint, IMinMaxMap } from '@/types/types'

export function getMonthDay (dateString: string): string {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${month}-${day}`
}

export function processEnergyData (data: { [key: string]: { '4. close': string } }): IDataPoint[] {
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

    // Collect data for the current year
    if (new Date(date).getFullYear() === new Date().getFullYear()) {
      currentYearData.push({
        date,
        price,
        current: price, // Initially set current to price for the same year
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

      // Check if there's a match in currentYearData for the same month-day
      const currentMatch = currentYearData.find(
        dataPoint => getMonthDay(dataPoint.date) === monthDay
      )

      // Set 'current' as the difference if there's no match in the current year
      map[monthDay] = {
        min: minValue,
        max: maxValue,
        difference,
        price: difference,
        current: currentMatch ? currentMatch.price : difference,
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

  // Step 3: Map current year data with correct 'current' value
  return currentYearData.map(({ date, price }) => {
    const monthDay = getMonthDay(date)
    const minMax = minMaxMapResult[monthDay] || {
      min: 0,
      max: 0,
      difference: 0,
      price: 0,
      current: 0, // Default to 0 if no match found
    }

    // If the year matches, the current value should be the same as the price
    const isSameYear = new Date(date).getFullYear() === new Date().getFullYear()
    return {
      date: formatDate(date),
      min: minMax.min,
      max: minMax.max,
      difference: minMax.difference,
      price, // Keep the original price for this date
      current: isSameYear ? price : minMax.difference, // Use price if same year, otherwise use the difference
    }
  })
}
