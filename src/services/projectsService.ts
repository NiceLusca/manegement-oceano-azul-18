
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    const mockProjects: Project[] = [];
    
    if (!tasksData || tasksData.length === 0) {
      const { projects } = await import('@/data/mock-data');
      return projects;
    } else {
      const realTasks = tasksData.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status as 'todo' | 'in-progress' | 'review' | 'completed',
        assigneeId: task.assignee_id || '',
        dueDate: task.due_date || new Date().toISOString(),
        priority: task.priority as 'low' | 'medium' | 'high',
        projectId: 'default-project'
      }));

      const defaultProject: Project = {
        id: 'default-project',
        name: 'Tarefas do Sistema',
        description: 'Todas as tarefas registradas no sistema',
        status: 'in-progress',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0,
        teamMembers: tasksData
          .filter(task => task.assignee_id)
          .map(task => task.assignee_id as string),
        tasks: realTasks
      };

      mockProjects.push(defaultProject);
      return mockProjects;
    }
  } catch (error: any) {
    console.error('Erro ao buscar tarefas:', error.message);
    const { projects } = await import('@/data/mock-data');
    return projects;
  }
};
