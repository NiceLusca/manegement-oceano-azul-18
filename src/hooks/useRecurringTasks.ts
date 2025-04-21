import { useState, useEffect } from 'react';
import { RecurringTask, TaskInstance } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRecurringTasksWithInstances } from '@/services/tasks/recurringTaskService';
import { updateTaskInstanceStatus } from '@/services/tasks/basicTaskService';

export function useRecurringTasksEnhanced() {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getRecurringTasksWithInstances();
      setRecurringTasks(data);
      
      const allInstances = data.reduce((acc: TaskInstance[], task) => {
        return [...acc, ...(task.instances || [])];
      }, []);
      
      allInstances.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      setTaskInstances(allInstances);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas recorrentes',
        variant: 'destructive',
      });
      console.error('Error fetching recurring tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const recurringSubscription = supabase
      .channel('recurring-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recurring_tasks' },
        () => fetchData()
      )
      .subscribe();

    const instancesSubscription = supabase
      .channel('instances-changes-recurring')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_instances' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(recurringSubscription);
      supabase.removeChannel(instancesSubscription);
    };
  }, []);

  const changeInstanceStatus = async (instanceId: string, newStatus: TaskInstance['status']) => {
    try {
      const success = await updateTaskInstanceStatus(instanceId, newStatus);
      
      if (success) {
        setTaskInstances(prev => 
          prev.map(instance => 
            instance.id === instanceId 
              ? { ...instance, status: newStatus } 
              : instance
          )
        );
        
        setRecurringTasks(prev => 
          prev.map(task => ({
            ...task,
            instances: (task.instances || []).map(instance => 
              instance.id === instanceId 
                ? { ...instance, status: newStatus } 
                : instance
            )
          }))
        );
        
        toast({
          title: 'Status atualizado',
          description: `Tarefa movida para ${
            newStatus === 'todo' ? 'A Fazer' :
            newStatus === 'in-progress' ? 'Em Progresso' :
            newStatus === 'review' ? 'Em Revisão' :
            'Concluído'
          }`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating task instance status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status da tarefa',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    recurringTasks,
    taskInstances,
    isLoading,
    refreshData: fetchData,
    changeInstanceStatus
  };
}
