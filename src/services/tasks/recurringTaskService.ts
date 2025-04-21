import { supabase } from '@/integrations/supabase/client';
import { Task, RecurringTask, TaskInstance } from '@/types';
import { addActivityEntry } from '@/services/teamActivityService';

// Fetch all tasks including recurring task instances
export const getTasksWithDetails = async (departmentFilter: string | null = null) => {
  try {
    // Base query for regular tasks
    let regularTasksQuery = supabase
      .from('tasks')
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
      .order('due_date', { ascending: true });
      
    // Base query for recurring task instances
    let instanceTasksQuery = supabase
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
      .order('due_date', { ascending: true });
    
    // Apply department filter if provided
    if (departmentFilter) {
      regularTasksQuery = regularTasksQuery.eq('assignee.departamento_id', departmentFilter);
      instanceTasksQuery = instanceTasksQuery.eq('assignee.departamento_id', departmentFilter);
    }
    
    // Execute queries
    const [regularTasksResult, instanceTasksResult] = await Promise.all([
      regularTasksQuery,
      instanceTasksQuery
    ]);
    
    const regularTasks = regularTasksResult.data || [];
    const instanceTasks = instanceTasksResult.data || [];
    
    if (regularTasksResult.error && !regularTasksResult.error.message.includes("does not exist")) {
      throw regularTasksResult.error;
    }
    
    if (instanceTasksResult.error && !instanceTasksResult.error.message.includes("does not exist")) {
      throw instanceTasksResult.error;
    }
    
    // Format regular tasks
    const formattedRegularTasks = regularTasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status as Task['status'],
      assigneeId: task.assignee_id || '',
      dueDate: task.due_date || new Date().toISOString(),
      priority: task.priority as 'low' | 'medium' | 'high',
      assignee: task.assignee,
      projectId: 'default-category',
      isRecurring: false,
      completedAt: task.completed_at
    }));
    
    // Format recurring task instances
    const formattedInstanceTasks = instanceTasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status as Task['status'],
      assigneeId: task.assignee_id || '',
      dueDate: task.due_date || new Date().toISOString(),
      priority: task.priority as 'low' | 'medium' | 'high',
      assignee: task.assignee,
      projectId: task.project_id || 'default-category',
      isRecurring: true,
      recurringTaskId: task.recurring_task_id,
      completedAt: task.completed_at
    }));
    
    return [...formattedRegularTasks, ...formattedInstanceTasks];
  } catch (error: any) {
    console.error('Erro ao buscar tarefas com detalhes:', error.message);
    return [];
  }
};

// Reset completed recurring tasks to 'todo' status and generate new instances
export const resetCompletedRecurringTasks = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Fetch completed recurring task instances
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('status', 'completed')
      .not('recurring_task_id', 'is', null);
      
    if (error) {
      if (error.message.includes("does not exist")) {
        console.error("A tabela 'task_instances' não existe no banco de dados");
        return false;
      }
      throw error;
    }
    
    // Process each completed task
    for (const task of data || []) {
      await processCompletedTask(task);
    }
    
    return true;
  } catch (error: any) {
    console.error('Erro ao resetar tarefas recorrentes:', error.message);
    return false;
  }
};

// Helper function to process a completed task
async function processCompletedTask(task: any) {
  try {
    if (!task.recurring_task_id) return;
    
    // Check if recurring task is still active
    const { data: recurringData, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', task.recurring_task_id)
      .single();
      
    if (recurringError) {
      console.error('Erro ao buscar tarefa recorrente:', recurringError);
      return;
    }
    
    if (!recurringData) return;
    
    // Check if task hasn't expired
    if (recurringData.end_date && new Date(recurringData.end_date) < new Date()) {
      return;
    }
    
    // Create new instance for today
    await createNewTaskInstance(task, recurringData);
    
    // Log activity
    await logTaskRegeneration(task);
  } catch (error) {
    console.error('Erro ao processar tarefa completada:', error);
  }
}

// Helper function to create a new task instance
async function createNewTaskInstance(task: any, recurringData: any) {
  try {
    const today = new Date();
    
    // Insert new task instance
    const { data: newInstance, error: insertError } = await supabase
      .from('task_instances')
      .insert([{
        title: task.title,
        description: task.description,
        assignee_id: task.assignee_id,
        due_date: today.toISOString(),
        status: 'todo',
        priority: task.priority,
        recurring_task_id: task.recurring_task_id,
        project_id: task.project_id,
        completed_at: null
      }])
      .select();
      
    if (insertError) {
      console.error('Erro ao criar nova instância de tarefa:', insertError);
      return;
    }
    
    // Update last_generated in recurring task
    const { error: updateError } = await supabase
      .from('recurring_tasks')
      .update({
        last_generated: today.toISOString()
      })
      .eq('id', task.recurring_task_id);
      
    if (updateError) {
      console.error('Erro ao atualizar data de última geração:', updateError);
    }
    
    return newInstance?.[0];
  } catch (error) {
    console.error('Erro ao criar nova instância de tarefa:', error);
    return null;
  }
}

// Helper function to log task regeneration
async function logTaskRegeneration(task: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'system';
    
    await addActivityEntry({
      user_id: userId,
      action: 'regenerate_task',
      entity_type: 'task_instance',
      entity_id: task.id,
      details: JSON.stringify({
        taskTitle: task.title,
        recurringTaskId: task.recurring_task_id,
        previousInstanceId: task.id
      })
    });
  } catch (error) {
    console.error('Erro ao registrar regeneração de tarefa no histórico:', error);
  }
}

// Get recurring tasks with their instances
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
        status: instance.status as TaskInstance['status'],
        assigneeId: instance.assignee_id || '',
        dueDate: instance.due_date,
        priority: instance.priority as 'low' | 'medium' | 'high',
        recurringTaskId: instance.recurring_task_id,
        projectId: instance.project_id || 'default-project',
        createdAt: instance.created_at || new Date().toISOString(),
        updatedAt: instance.updated_at || new Date().toISOString(),
        completedAt: instance.completed_at
      });
      
      return acc;
    }, {} as Record<string, TaskInstance[]>);
    
    return (recurringTasks || []).map((task: any) => ({
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
      instances: instancesByRecurringTaskId[task.id] || []
    }));
  } catch (error: any) {
    console.error('Error fetching recurring tasks with instances:', error.message);
    return [];
  }
};
