
// Database row types for better type safety when working with Supabase
export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RecurringTaskRow {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  recurrence_type: string;
  start_date: string;
  end_date: string | null;
  custom_days: number[] | null;
  custom_months: number[] | null;
  project_id: string | null;
  last_generated: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TaskInstanceRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  due_date: string;
  recurring_task_id: string | null;
  project_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProfileRow {
  id: string;
  nome: string | null;
  cargo: string | null;
  avatar_url: string | null;
  departamento_id: string | null;
  nivel_acesso: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DepartamentosRow {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string | null;
  created_at: string | null;
  updated_at: string | null;
}
