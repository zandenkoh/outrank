export interface User {
  id: string;
  nickname?: string;
  school_code: string;
  school_name: string;
  level: string;
  opted_in_cohort?: boolean;
  created_at?: string;
  updated_at?: string;
  last_active_at?: string;
}

export interface School {
  school_code: string;
  school_name: string;
  average_overall?: number;
  national_rank?: number;
  total_students?: number;
  level: string;
}

export interface SubjectRanking {
  subject: string;
  average?: number;
  total_students: number;
}

export interface InitialData {
  initialUser: User;
  initialSchoolRankings: School[];
  initialSubjectRankings: SubjectRanking[];
  initialUserPercentiles: Record<string, number>;
  initialUserSchoolFallback: boolean;
}