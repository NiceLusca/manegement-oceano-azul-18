
import { useState, useEffect } from 'react';
import { Task, RecurringTask, TaskInstance } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  getTasksWithDetails, 
  updateTaskStatus, 
  resetCompletedRecurringTasks 
} from '@/services/tasks';
import { TaskRow, RecurringTaskRow, TaskInstanceRow, ProfileRow } from '@/types/supabase-types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all tasks (regular and recurring instances)
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

  // Initial fetch
  useEffect(() => {
    fetchAllTasks();
  }, [departmentFilter]);

  // Reset recurring tasks on component mount and at midnight
  useEffect(() => {
    const resetRecurringTasks = async () => {
      try {
        await resetCompletedRecurringTasks();
        console.log('Tarefas recorrentes resetadas com sucesso');
      } catch (error) {
        console.error('Erro ao resetar tarefas recorrentes:', error);
      }
    };
    
    // Run immediately
    resetRecurringTasks();
    
    // Calculate time until midnight
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const timeToMidnight = night.getTime() - now.getTime();
    
    // Set up timer for midnight
    const timer = setTimeout(() => {
      resetRecurringTasks();
      
      // Then set up daily interval
      const interval = setInterval(resetRecurringTasks, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeToMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  // Set up realtime subscriptions for all task tables
  useEffect(() => {
    // Subscribe to changes in tasks table
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchAllTasks()
      )
      .subscribe();

    // Subscribe to changes in task_instances table
    const instancesSubscription = supabase
      .channel('instances-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_instances' },
        () => fetchAllTasks()
      )
      .subscribe();

    // Subscribe to changes in recurring_tasks table
    const recurringSubscription = supabase
      .channel('recurring-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recurring_tasks' },
        () => fetchAllTasks()
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(instancesSubscription);
      supabase.removeChannel(recurringSubscription);
    };
  }, []);

  // Update task status with optimistic update
  const changeTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    // Optimistic update
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      const success = await updateTaskStatus(taskId, newStatus);
      
      if (!success) {
        // Revert optimistic update if it failed
        fetchAllTasks();
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status da tarefa",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert optimistic update
      fetchAllTasks();
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive"
      });
    }
  };

  // Get tasks for a specific status
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

export function useRecurringTasksEnhanced() {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecurringTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from<RecurringTaskRow>('recurring_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRecurringTasks = (data || []).map(task => ({
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
        .from<TaskInstanceRow>('task_instances')
        .select('*')
        .not('recurring_task_id', 'is', null)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const mappedInstances = (data || []).map(instance => ({
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

  // Set up realtime subscriptions
  useEffect(() => {
    // Initial fetch
    fetchRecurringTasks();
    fetchTaskInstances();

    // Subscribe to changes in recurring_tasks table
    const recurringSubscription = supabase
      .channel('recurring-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recurring_tasks' },
        () => fetchRecurringTasks()
      )
      .subscribe();

    // Subscribe to changes in task_instances table
    const instancesSubscription = supabase
      .channel('instances-changes-recurring')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_instances' },
        () => fetchTaskInstances()
      )
      .subscribe();

    // Clean up subscriptions
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
