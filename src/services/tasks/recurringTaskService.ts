
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';

// Fetch all tasks including recurring task instances
export const getTasksWithDetails = async () => {
  try {
    // Fetch regular tasks
    const { data: regularTasks, error: regularError } = await supabase
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
      
    if (regularError && !regularError.message.includes("does not exist")) {
      throw regularError;
    }
    
    // Fetch recurring task instances
    const { data: instanceTasks, error: instanceError } = await supabase
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
      
    if (instanceError && !instanceError.message.includes("does not exist")) {
      throw instanceError;
    }
    
    // Format regular tasks
    const formattedRegularTasks = (regularTasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      assigneeId: task.assignee_id || '',
      dueDate: task.due_date || new Date().toISOString(),
      priority: task.priority,
      assignee: task.assignee,
      projectId: 'default-category',
      isRecurring: false
    }));
    
    // Format recurring task instances
    const formattedInstanceTasks = (instanceTasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      assigneeId: task.assignee_id || '',
      dueDate: task.due_date || new Date().toISOString(),
      priority: task.priority,
      assignee: task.assignee,
      projectId: 'default-category',
      isRecurring: true,
      recurringTaskId: task.recurring_task_id
    }));
    
    return [...formattedRegularTasks, ...formattedInstanceTasks];
  } catch (error: any) {
    console.error('Erro ao buscar tarefas com detalhes:', error.message);
    return [];
  }
};

// Reset completed recurring tasks to 'todo' status
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
  const today = new Date();
  const { error: insertError } = await supabase
    .from('task_instances')
    .insert([{
      title: task.title,
      description: task.description,
      assignee_id: task.assignee_id,
      due_date: today.toISOString(),
      status: 'todo',
      priority: task.priority,
      recurring_task_id: task.recurring_task_id
    }]);
    
  if (insertError) {
    console.error('Erro ao criar nova instância de tarefa:', insertError);
  }
}

// Helper function to log task regeneration
async function logTaskRegeneration(task: any) {
  try {
    await supabase
      .from('team_activity_view')
      .insert([{
        user_id: task.assignee_id,
        action: 'regenerate_task',
        entity_type: 'task',
        entity_id: task.recurring_task_id,
        details: `Tarefa recorrente "${task.title}" regenerada automaticamente`
      }]);
  } catch (error) {
    console.error('Erro ao registrar no histórico:', error);
  }
}
