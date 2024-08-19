export interface ITimeSeriesDaily {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  }

export interface IMinMaxMap {
  [key: string]: {
    min: number;
    max: number;
    current: number;
    price: number;
    difference: number;
  };
}

export interface IDataPoint {
  date: string;
  price: number;
  min?: number;
  max?: number;
  current: number;
  difference: number;
}
