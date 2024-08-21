import { IDataPoint } from '@/types/types'

// Method to format date
const formatDate = (value: string) => {
  const date = new Date(value)
  return date.toLocaleDateString('en-ZM', {
    month: 'short',
    day: '2-digit',
  })
}
// Function to return raw data without manipulation
export function getRawData (data: { [key: string]: { '4. close': string } }): IDataPoint[] {
  return Object.entries(data).map(([date, { '4. close': close }]) => {
    const price = parseFloat(close)
    return {
      date: formatDate(date),
      price,
      current: price,
      difference: 0,
    }
  })
}
