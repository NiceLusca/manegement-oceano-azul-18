
import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  getTasksWithDetails, 
  updateTaskStatus, 
  resetCompletedRecurringTasks 
} from '@/services/tasks';

export function useRegularTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      const tasksData = await getTasksWithDetails(departmentFilter);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, [departmentFilter]);

  useEffect(() => {
    const resetRecurringTasks = async () => {
      try {
        await resetCompletedRecurringTasks();
        console.log('Tarefas recorrentes resetadas com sucesso');
      } catch (error) {
        console.error('Erro ao resetar tarefas recorrentes:', error);
      }
    };
    
    resetRecurringTasks();
    
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const timeToMidnight = night.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      resetRecurringTasks();
      const interval = setInterval(resetRecurringTasks, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeToMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchAllTasks()
      )
      .subscribe();

    const instancesSubscription = supabase
      .channel('instances-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_instances' },
        () => fetchAllTasks()
      )
      .subscribe();

    const recurringSubscription = supabase
      .channel('recurring-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recurring_tasks' },
        () => fetchAllTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(instancesSubscription);
      supabase.removeChannel(recurringSubscription);
    };
  }, []);

  const changeTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      const success = await updateTaskStatus(taskId, newStatus);
      if (!success) {
        fetchAllTasks();
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status da tarefa",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchAllTasks();
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive"
      });
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return {
    tasks,
    isLoading,
    fetchAllTasks,
    changeTaskStatus,
    getTasksByStatus,
    departmentFilter,
    setDepartmentFilter,
    todoTasks: getTasksByStatus('todo'),
    inProgressTasks: getTasksByStatus('in-progress'),
    reviewTasks: getTasksByStatus('review'),
    completedTasks: getTasksByStatus('completed')
  };
}
