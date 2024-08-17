export interface TimeSeriesDaily {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  }

export interface IminMaxMap {
  [key: string]: {
    min: number;
    max: number;
    current: number;
    price: number;
    difference: number;
  };
}

export interface DataPoint {
  date: string;
  price: number;
  min?: number;
  max?: number;
  current: number;
}
