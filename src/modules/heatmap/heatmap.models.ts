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

export interface SeverityShades {
  mild: string;
  moderate: string;
  severe: string;
}

export const DISEASE_SHADES = {
  blackPod: { mild: '#fca5a5', moderate: '#ef4444', severe: '#b91c1c' },
  podBorer: { mild: '#fde68a', moderate: '#facc15', severe: '#ca8a04' },
  mealybug: { mild: '#bfdbfe', moderate: '#60a5fa', severe: '#1d4ed8' },
  healthy: { mild: '#22c55e', moderate: '#22c55e', severe: '#22c55e' },
} satisfies Record<string, SeverityShades>;
