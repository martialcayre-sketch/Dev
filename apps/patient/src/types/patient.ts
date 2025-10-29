export interface UserMe {
  id: string;
  firstName: string;
  lastName: string;
  unreadMessages: number;
}

export type AppointmentMode = "teleconsultation" | "in-person";

export interface NextAppointment {
  id: string;
  startsAt: string; // ISO string
  practitionerName: string;
  mode: AppointmentMode;
  location?: string;
  instructions?: string;
}

export type TodoKind = "questionnaire" | "document";

export interface TodoItem {
  id: string;
  kind: TodoKind;
  title: string;
  description?: string;
  relatedId: string;
  dueDate?: string;
  completed: boolean;
  read: boolean;
}

export interface MealPlanItem {
  id: string;
  title: string;
  time: string;
  description?: string;
  items: string[];
  done: boolean;
}

export interface SupplementPlanItem {
  id: string;
  title: string;
  time: string;
  dosage?: string;
  done: boolean;
}

export interface TodayPlan {
  meals: MealPlanItem[];
  supplements: SupplementPlanItem[];
}

export interface ProgressData {
  planAdherence: number;
  energy: number;
  sleep: number;
  stress: number;
  hydration: number;
}

export interface RecipeItem {
  id: string;
  title: string;
  calories: number;
  durationMinutes: number;
  tags: string[];
  url?: string;
}
