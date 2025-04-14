
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, Task, TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departamentos, setDepartamentos] = useState<{id: string, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
    fetchDepartamentos();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) throw tasksError;

      const mockProjects: Project[] = [];
      
      if (!tasksData || tasksData.length === 0) {
        const { projects } = await import('@/data/mock-data');
        setProjects(projects);
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
        setProjects(mockProjects);
      }
    } catch (error: any) {
      console.error('Erro ao buscar tarefas:', error.message);
      const { projects } = await import('@/data/mock-data');
      setProjects(projects);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      
      const formattedMembers: TeamMember[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.nome || 'Sem nome',
        role: profile.cargo || 'Colaborador',
        email: '',
        avatar: profile.avatar_url || '',
        department: profile.departamento_id || '',
        status: 'active' as 'active' | 'inactive',
        joinedDate: profile.created_at
      }));
      
      setTeamMembers(formattedMembers);
    } catch (error: any) {
      console.error('Erro ao buscar equipe:', error.message);
      const { teamMembers } = await import('@/data/mock-data');
      setTeamMembers(teamMembers);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('departamentos')
        .select('*');

      if (error) throw error;
      
      setDepartamentos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar departamentos:', error.message);
    }
  };

  const addTask = async (taskData: {
    titulo: string;
    descricao: string;
    status: string;
    prioridade: string;
    responsavel: string;
    dataVencimento: string;
  }) => {
    if (!taskData.titulo.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: taskData.titulo,
            description: taskData.descricao,
            status: taskData.status,
            priority: taskData.prioridade,
            assignee_id: taskData.responsavel || null,
            due_date: taskData.dataVencimento ? new Date(taskData.dataVencimento).toISOString() : null
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nova tarefa adicionada com sucesso!",
        variant: "default"
      });

      await fetchProjects();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar tarefa:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa: " + error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    projects,
    teamMembers,
    departamentos,
    loading,
    fetchProjects,
    fetchTeamMembers,
    fetchDepartamentos,
    addTask
  };
};
