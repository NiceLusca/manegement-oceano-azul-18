
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  department: string;
  status: 'active' | 'inactive';
  joinedDate: string;
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
  company: string;
  email: string;
  phone: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  lastContact: string;
  notes: string;
  assignedTo: string;
  value: number;
};
