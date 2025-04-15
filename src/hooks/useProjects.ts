
import { useState, useEffect } from 'react';
import { Project, Task, TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { fetchProjects } from '@/services/projectsService';
import { fetchTeamMembers } from '@/services/teamService';
import { fetchDepartamentos } from '@/services/departamentoService';
import { addTask, addRecurringTask } from '@/services/taskService';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departamentos, setDepartamentos] = useState<{id: string, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const projectsData = await fetchProjects();
        const membersData = await fetchTeamMembers();
        const departamentosData = await fetchDepartamentos();
        
        setProjects(projectsData);
        setTeamMembers(membersData);
        setDepartamentos(departamentosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleAddTask = async (taskData: {
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
      const success = await addTask(taskData);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Nova tarefa adicionada com sucesso!",
          variant: "default"
        });
        
        const updatedProjects = await fetchProjects();
        setProjects(updatedProjects);
        return true;
      }
      return false;
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

  const handleAddRecurringTask = async (taskData: {
    title: string;
    description: string;
    assigneeId: string;
    startDate: string;
    endDate?: string;
    recurrenceType: string;
    customDays?: number[];
    priority: string;
  }) => {
    if (!taskData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    try {
      const success = await addRecurringTask(taskData);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Nova tarefa recorrente adicionada com sucesso!",
          variant: "default"
        });
        
        const updatedProjects = await fetchProjects();
        setProjects(updatedProjects);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro ao adicionar tarefa recorrente:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa recorrente: " + error.message,
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
    fetchProjects: async () => {
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    },
    fetchTeamMembers: async () => {
      const membersData = await fetchTeamMembers();
      setTeamMembers(membersData);
    },
    fetchDepartamentos: async () => {
      const departamentosData = await fetchDepartamentos();
      setDepartamentos(departamentosData);
    },
    addTask: handleAddTask,
    addRecurringTask: handleAddRecurringTask
  };
};
