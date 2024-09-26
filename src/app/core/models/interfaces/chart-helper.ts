import { Color } from "@swimlane/ngx-charts";

export interface NgxBarChartOption {
  colorScheme?: Color;
  results: {
    name?: string;
    series: {
      name: string;
      value: number;
    }[];
  }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface NgxHeatMapChartOption {
  name: string;
  series: {
    name: string;
    value: number;
  }[];
}
