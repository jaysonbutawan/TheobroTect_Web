import { ScanDto } from '../dashboard/dashboard.dto';

export interface DiseaseCounts {
  healthy: number;
  blackPod: number;
  mealybug: number;
  podBorer: number;
  other: number;
  total: number;
}

export interface Observation {
  text: string;
  time: Date;
}

export interface FilterState {
  year: number;
  month?: number | null;
  disease: string;
}
