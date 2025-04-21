import { supabase } from '@/integrations/supabase/client';
import { addActivityEntry } from '@/services/teamActivityService';
import { Task } from '@/types';

// Basic task status update
export const updateTaskStatus = async (taskId: string, newStatus: string) => {
  try {
    // Validar status
    if (!['todo', 'in-progress', 'review', 'completed'].includes(newStatus)) {
      throw new Error('Status inválido');
    }
    
    // Obter informações da tarefa antes da atualização
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (taskError) {
      console.error('Erro ao buscar tarefa:', taskError);
      return false;
    }
    
    // Se a tarefa estiver sendo marcada como concluída, registrar a data de conclusão
    const updates: any = { 
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else if (taskData.completed_at && newStatus !== 'completed') {
      // Se estiver saindo do status concluído, remover a data de conclusão
      updates.completed_at = null;
    }
    
    // Atualizar no banco de dados
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);
      
    if (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      return false;
    }
    
    // Registrar a atividade no histórico
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';
      
      await addActivityEntry({
        user_id: userId,
        action: 'update_status',
        entity_type: 'task',
        entity_id: taskId,
        details: JSON.stringify({
          taskTitle: taskData.title,
          oldStatus: taskData.status,
          newStatus: newStatus,
          completedAt: newStatus === 'completed' ? updates.completed_at : null,
          completedBy: newStatus === 'completed' ? userId : null
        })
      });
    } catch (historyError) {
      console.error('Erro ao registrar histórico:', historyError);
    }
    
    return true;
  } catch (error: any) {
    console.error('Erro ao atualizar status da tarefa:', error.message);
    return false;
  }
};

// Update task status for recurring task instance
export const updateTaskInstanceStatus = async (instanceId: string, newStatus: string) => {
  try {
    // Validar status
    if (!['todo', 'in-progress', 'review', 'completed'].includes(newStatus)) {
      throw new Error('Status inválido');
    }
    
    // Obter informações da instância de tarefa antes da atualização
    const { data: instanceData, error: instanceError } = await supabase
      .from('task_instances')
      .select('*')
      .eq('id', instanceId)
      .single();
      
    if (instanceError) {
      console.error('Erro ao buscar instância de tarefa:', instanceError);
      return false;
    }
    
    if (!instanceData) {
      console.error('Instância de tarefa não encontrada');
      return false;
    }
    
    // Prepare updates
    const updates: any = { 
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else if (instanceData.completed_at && newStatus !== 'completed') {
      // Se estiver saindo do status concluído, remover a data de conclusão
      updates.completed_at = null;
    }
    
    // Atualizar no banco de dados
    const { error } = await supabase
      .from('task_instances')
      .update(updates)
      .eq('id', instanceId);
      
    if (error) {
      console.error('Erro ao atualizar status da instância de tarefa:', error);
      return false;
    }
    
    // Se a tarefa for recorrente e estiver marcada como concluída, atualizar o registro de tarefa recorrente
    if (newStatus === 'completed' && instanceData.recurring_task_id) {
      const { error: recurringError } = await supabase
        .from('recurring_tasks')
        .update({ 
          last_generated: new Date().toISOString()
        })
        .eq('id', instanceData.recurring_task_id);
        
      if (recurringError) {
        console.error('Erro ao atualizar tarefa recorrente:', recurringError);
      }
    }
    
    // Registrar a atividade no histórico
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';
      
      await addActivityEntry({
        user_id: userId,
        action: 'update_status',
        entity_type: 'task_instance',
        entity_id: instanceId,
        details: JSON.stringify({
          taskTitle: instanceData.title,
          oldStatus: instanceData.status,
          newStatus: newStatus,
          isRecurring: instanceData.recurring_task_id ? true : false,
          completedAt: newStatus === 'completed' ? updates.completed_at : null,
          completedBy: newStatus === 'completed' ? userId : null
        })
      });
    } catch (historyError) {
      console.error('Erro ao registrar histórico:', historyError);
    }
    
    return true;
  } catch (error: any) {
    console.error('Erro ao atualizar status da instância de tarefa:', error.message);
    return false;
  }
};

// Get tasks by department
export const getTasksByDepartment = async (departmentId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles:assignee_id (
          departamento_id
        )
      `)
      .eq('profiles.departamento_id', departmentId);
      
    if (error) {
      console.error('Erro ao buscar tarefas por departamento:', error);
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Erro ao buscar tarefas por departamento:', error.message);
    return [];
  }
};

// Delete task
export const deleteTask = async (taskId: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
      
    if (error) {
      console.error('Erro ao excluir tarefa:', error);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Erro ao excluir tarefa:', error.message);
    return false;
  }
};

// Delete recurring task and all its instances
export const deleteRecurringTask = async (recurringTaskId: string) => {
  try {
    // First delete all instances
    const { error: instancesError } = await supabase
      .from('task_instances')
      .delete()
      .eq('recurring_task_id', recurringTaskId);
      
    if (instancesError) {
      console.error('Erro ao excluir instâncias de tarefa recorrente:', instancesError);
      return false;
    }
    
    // Then delete the recurring task
    const { error } = await supabase
      .from('recurring_tasks')
      .delete()
      .eq('id', recurringTaskId);
      
    if (error) {
      console.error('Erro ao excluir tarefa recorrente:', error);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Erro ao excluir tarefa recorrente:', error.message);
    return false;
  }
};

export const getTasksWithDetails = async (departmentFilter: string | null): Promise<Task[]> => {
  try {
    let query = supabase
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
      
    if (departmentFilter) {
      // Join with profiles to filter by department
      query = query.eq('assignee.departamento_id', departmentFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
    
    // Transform the data to match the Task type with proper status typing
    return (data || []).map(task => {
      // Ensure status is one of the valid Task status values
      let validStatus: Task['status'] = 'todo'; // Default fallback
      
      if (['todo', 'in-progress', 'review', 'completed'].includes(task.status)) {
        validStatus = task.status as Task['status'];
      } else {
        // Log unexpected status values for debugging
        console.warn(`Unexpected task status: ${task.status}, defaulting to 'todo'`);
      }
      
      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: validStatus,
        assigneeId: task.assignee_id || '',
        dueDate: task.due_date,
        priority: task.priority as Task['priority'], // Apply proper typing to priority as well
        projectId: task.project_id || 'default-project',
        isRecurring: !!task.recurring_task_id,
        recurringTaskId: task.recurring_task_id,
        assignee: task.assignee,
        completedAt: task.completed_at
      };
    });
  } catch (error: any) {
    console.error('Error fetching tasks with details:', error.message);
    return [];
  }
};
