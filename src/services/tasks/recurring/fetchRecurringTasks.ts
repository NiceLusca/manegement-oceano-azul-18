
import { supabase } from '@/integrations/supabase/client';
import { RecurringTask, TaskInstance } from '@/types';

export const getRecurringTasksWithInstances = async (): Promise<RecurringTask[]> => {
  try {
    const { data: recurringTasks, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select(`
        *,
        assignee:assignee_id (
          id,
          nome,
          cargo,
          avatar_url,
          departamento_id
        )
      `)
      .order('created_at', { ascending: false });
      
    if (recurringError) {
      throw recurringError;
    }
    
    const { data: instances, error: instancesError } = await supabase
      .from('task_instances')
      .select(`
        *,
        assignee:assignee_id (
          id,
          nome,
          cargo,
          avatar_url,
          departamento_id
        )
      `)
      .not('recurring_task_id', 'is', null)
      .order('due_date', { ascending: true });
      
    if (instancesError) {
      throw instancesError;
    }
    
    const instancesByRecurringTaskId = (instances || []).reduce((acc: Record<string, TaskInstance[]>, instance: any) => {
      if (!instance.recurring_task_id) return acc;
      
      if (!acc[instance.recurring_task_id]) {
        acc[instance.recurring_task_id] = [];
      }
      
      acc[instance.recurring_task_id].push({
        id: instance.id,
        title: instance.title,
        description: instance.description || '',
        status: instance.status,
        assigneeId: instance.assignee_id || '',
        dueDate: instance.due_date,
        priority: instance.priority,
        recurringTaskId: instance.recurring_task_id,
        projectId: instance.project_id || 'default-project',
        createdAt: instance.created_at || new Date().toISOString(),
        updatedAt: instance.updated_at || new Date().toISOString(),
        completedAt: instance.completed_at
      });
      
      return acc;
    }, {});
    
    return (recurringTasks || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      assigneeId: task.assignee_id || '',
      recurrenceType: task.recurrence_type,
      customDays: task.custom_days || [],
      customMonths: task.custom_months || [],
      startDate: task.start_date,
      endDate: task.end_date || null,
      lastGenerated: task.last_generated || null,
      createdAt: task.created_at || new Date().toISOString(),
      updatedAt: task.updated_at || new Date().toISOString(),
      projectId: task.project_id || 'default-project',
      instances: instancesByRecurringTaskId[task.id] || []
    }));
  } catch (error: any) {
    console.error('Error fetching recurring tasks with instances:', error.message);
    return [];
  }
};
