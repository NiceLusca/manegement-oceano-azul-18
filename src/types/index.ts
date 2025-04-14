
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  department: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  accessLevel?: 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user';
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed';
  deadline: string;
  progress: number;
  teamMembers: string[];
  tasks: Task[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  assigneeId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  projectId: string;
};

export type Customer = {
  id: string;
  name: string;
  origem: string; // Changed from company to origem
  email: string;
  phone: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  lastContact: string;
  notes: string;
  assignedTo: string;
  value: number;
};

export type RecurringTask = {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays: number[] | null;
  customMonths: number[] | null;
  startDate: string;
  endDate: string | null;
  lastGenerated: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string; // Added projectId for association with projects
};

export type TaskInstance = {
  id: string;
  recurringTaskId: string | null;
  title: string;
  description: string | null;
  assigneeId: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  projectId: string; // Added projectId for association with projects
};
