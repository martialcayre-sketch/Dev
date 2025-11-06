export type LifeJourneyData = {
  id: string;
  answers: Record<string, Record<string, number>>;
  scores: Record<
    string,
    {
      raw: number;
      max: number;
      percent: number;
    }
  >;
  global: number;
  completedAt: string;
  submittedAt: any;
};

export type PatientComplaint = {
  id: string;
  label: string;
  value: number;
  colorScheme: string;
};
