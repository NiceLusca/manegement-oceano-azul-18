
import { useState, useEffect } from 'react';
import { RecurringTask, TaskInstance } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useRecurringTasksEnhanced() {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecurringTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRecurringTasks = (data || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        assigneeId: task.assignee_id || '',
        recurrenceType: task.recurrence_type as 'daily' | 'weekly' | 'monthly' | 'custom',
        customDays: task.custom_days || [],
        customMonths: task.custom_months || [],
        startDate: task.start_date,
        endDate: task.end_date || null,
        lastGenerated: task.last_generated || null,
        createdAt: task.created_at || new Date().toISOString(),
        updatedAt: task.updated_at || new Date().toISOString(),
        projectId: task.project_id || 'default-project',
      }));

      setRecurringTasks(formattedRecurringTasks);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas recorrentes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskInstances = async () => {
    try {
      const { data, error } = await supabase
        .from('task_instances')
        .select('*')
        .not('recurring_task_id', 'is', null)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const mappedInstances = (data || []).map((instance: any) => ({
        id: instance.id,
        recurringTaskId: instance.recurring_task_id || null,
        title: instance.title,
        description: instance.description || '',
        assigneeId: instance.assignee_id || '',
        dueDate: instance.due_date,
        status: instance.status as 'todo' | 'in-progress' | 'review' | 'completed',
        priority: instance.priority as 'low' | 'medium' | 'high',
        createdAt: instance.created_at || new Date().toISOString(),
        updatedAt: instance.updated_at || new Date().toISOString(),
        projectId: instance.project_id || 'default-project',
      }));
      setTaskInstances(mappedInstances);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as instâncias de tarefas',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRecurringTasks();
    fetchTaskInstances();

    const recurringSubscription = supabase
      .channel('recurring-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recurring_tasks' },
        () => fetchRecurringTasks()
      )
      .subscribe();

    const instancesSubscription = supabase
      .channel('instances-changes-recurring')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_instances' },
        () => fetchTaskInstances()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(recurringSubscription);
      supabase.removeChannel(instancesSubscription);
    };
  }, []);

  return {
    recurringTasks,
    taskInstances,
    isLoading,
    refreshData: () => {
      fetchRecurringTasks();
      fetchTaskInstances();
    }
  };
}
