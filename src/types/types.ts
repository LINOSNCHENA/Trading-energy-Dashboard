export interface OriginalData {
    date: string;
    amount: any;
  }

export interface TimeSeriesDaily {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  }

// Define the interface for the min/max map
export interface IminMaxMap {
  [key: string]: {
    min: number;
    max: number;
    current: number;
    difference: number;
  };
}
