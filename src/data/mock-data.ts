import { TeamMember, Project, Task, Customer } from '@/types';

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Team Lead',
    email: 'john.doe@company.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
    department: 'Engineering',
    status: 'active',
    joinedDate: '2022-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    role: 'Frontend Developer',
    email: 'jane.smith@company.com',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=0D8ABC&color=fff',
    department: 'Engineering',
    status: 'active',
    joinedDate: '2022-03-10',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    role: 'Backend Developer',
    email: 'mike.johnson@company.com',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=0D8ABC&color=fff',
    department: 'Engineering',
    status: 'active',
    joinedDate: '2022-02-22',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    role: 'UI/UX Designer',
    email: 'sarah.williams@company.com',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=0D8ABC&color=fff',
    department: 'Design',
    status: 'active',
    joinedDate: '2022-04-05',
  },
  {
    id: '5',
    name: 'David Brown',
    role: 'Product Manager',
    email: 'david.brown@company.com',
    avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=0D8ABC&color=fff',
    department: 'Product',
    status: 'active',
    joinedDate: '2021-11-30',
  },
  {
    id: '6',
    name: 'Lisa Chen',
    role: 'QA Engineer',
    email: 'lisa.chen@company.com',
    avatar: 'https://ui-avatars.com/api/?name=Lisa+Chen&background=0D8ABC&color=fff',
    department: 'Engineering',
    status: 'inactive',
    joinedDate: '2022-01-20',
  },
];

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Design new dashboard',
    description: 'Create wireframes and mockups for the new dashboard.',
    status: 'completed',
    assigneeId: '4',
    dueDate: '2025-04-10',
    priority: 'high',
    projectId: '1',
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality.',
    status: 'in-progress',
    assigneeId: '3',
    dueDate: '2025-04-15',
    priority: 'high',
    projectId: '1',
  },
  {
    id: '3',
    title: 'Develop landing page',
    description: 'Create responsive landing page for the website.',
    status: 'todo',
    assigneeId: '2',
    dueDate: '2025-04-18',
    priority: 'medium',
    projectId: '1',
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Document all API endpoints for developers.',
    status: 'review',
    assigneeId: '1',
    dueDate: '2025-04-12',
    priority: 'medium',
    projectId: '1',
  },
  {
    id: '5',
    title: 'Prepare product roadmap',
    description: 'Plan features and deadlines for Q2 2025.',
    status: 'in-progress',
    assigneeId: '5',
    dueDate: '2025-04-20',
    priority: 'high',
    projectId: '2',
  },
  {
    id: '6',
    title: 'Test new features',
    description: 'Run tests on all new features implemented this sprint.',
    status: 'todo',
    assigneeId: '6',
    dueDate: '2025-04-22',
    priority: 'medium',
    projectId: '2',
  },
  {
    id: '7',
    title: 'Optimize database queries',
    description: 'Improve performance of slow database queries.',
    status: 'todo',
    assigneeId: '3',
    dueDate: '2025-04-25',
    priority: 'medium',
    projectId: '1',
  },
  {
    id: '8',
    title: 'Create marketing materials',
    description: 'Design promotional materials for social media.',
    status: 'in-progress',
    assigneeId: '4',
    dueDate: '2025-04-28',
    priority: 'low',
    projectId: '3',
  },
];

export const projects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with new branding.',
    status: 'in-progress',
    deadline: '2025-05-15',
    progress: 45,
    teamMembers: ['1', '2', '3', '4'],
    tasks: tasks.filter(task => task.projectId === '1'),
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Create native mobile applications for iOS and Android.',
    status: 'planning',
    deadline: '2025-06-30',
    progress: 20,
    teamMembers: ['1', '3', '5', '6'],
    tasks: tasks.filter(task => task.projectId === '2'),
  },
  {
    id: '3',
    name: 'Product Launch Campaign',
    description: 'Marketing campaign for the new product launch.',
    status: 'in-progress',
    deadline: '2025-05-01',
    progress: 60,
    teamMembers: ['4', '5'],
    tasks: tasks.filter(task => task.projectId === '3'),
  },
];

export const customers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'Acme Corp',
    email: 'john.smith@acmecorp.com',
    phone: '(555) 123-4567',
    status: 'customer',
    lastContact: '2025-04-01',
    notes: 'Long-term enterprise client, considering expansion',
    assignedTo: '1',
    value: 25000,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    company: 'Globex Industries',
    email: 'sarah.j@globex.com',
    phone: '(555) 987-6543',
    status: 'lead',
    lastContact: '2025-04-05',
    notes: 'Interested in our premium plan',
    assignedTo: '2',
    value: 5000,
  },
  {
    id: '3',
    name: 'Michael Brown',
    company: 'Oceanic Airlines',
    email: 'mbrown@oceanic.com',
    phone: '(555) 555-5555',
    status: 'prospect',
    lastContact: '2025-04-08',
    notes: 'Meeting scheduled for next week',
    assignedTo: '5',
    value: 15000,
  },
  {
    id: '4',
    name: 'Lisa Chen',
    company: 'Stark Industries',
    email: 'lisa.chen@stark.com',
    phone: '(555) 333-2222',
    status: 'customer',
    lastContact: '2025-03-28',
    notes: 'Current client, due for renewal next month',
    assignedTo: '3',
    value: 18000,
  },
  {
    id: '5',
    name: 'David Wilson',
    company: 'Wayne Enterprises',
    email: 'dwilson@wayne.com',
    phone: '(555) 777-8888',
    status: 'churned',
    lastContact: '2025-02-15',
    notes: 'Left due to budget constraints, follow up in Q3',
    assignedTo: '4',
    value: 0,
  },
  {
    id: '6',
    name: 'Emily Davis',
    company: 'Umbrella Corporation',
    email: 'e.davis@umbrellacorp.com',
    phone: '(555) 444-1111',
    status: 'prospect',
    lastContact: '2025-04-10',
    notes: 'Very interested in our services, requested proposal',
    assignedTo: '1',
    value: 12000,
  },
];

export const getTasksByStatus = () => {
  const taskStats = {
    todo: tasks.filter(task => task.status === 'todo').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    review: tasks.filter(task => task.status === 'review').length,
    completed: tasks.filter(task => task.status === 'completed').length,
  };
  return taskStats;
};

export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return teamMembers.find(member => member.id === id);
};

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getTaskById = (id: string): Task | undefined => {
  return tasks.find(task => task.id === id);
};

export const getTasksByAssignee = (assigneeId: string): Task[] => {
  return tasks.filter(task => task.assigneeId === assigneeId);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

export const getCustomersByStatus = (status: Customer['status']): Customer[] => {
  return customers.filter(customer => customer.status === status);
};

export const getCustomersByAssignee = (assigneeId: string): Customer[] => {
  return customers.filter(customer => customer.assignedTo === assigneeId);
};
