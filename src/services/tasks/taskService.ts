
import { supabase } from '@/integrations/supabase/client';
import { Task, RecurringTask, TaskInstance } from '@/types';
import { addActivityEntry } from '@/services/teamActivityService';

// =========== Funções de consulta de tarefas ===========

/**
 * Busca todas as tarefas com detalhes do responsável
 */
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
      
      // Ensure priority is one of the valid Task priority values
      let validPriority: Task['priority'] = 'medium'; // Default fallback
      
      if (['low', 'medium', 'high'].includes(task.priority)) {
        validPriority = task.priority as Task['priority'];
      } else {
        console.warn(`Unexpected task priority: ${task.priority}, defaulting to 'medium'`);
      }
      
      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: validStatus,
        assigneeId: task.assignee_id || '',
        dueDate: task.due_date,
        priority: validPriority,
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

/**
 * Busca tarefas por departamento
 */
export const getTasksByDepartment = async (departmentId: string): Promise<Task[]> => {
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
    
    // Transform the data to match the Task type
    return (data || []).map(task => {
      // Ensure status is one of the valid Task status values
      let validStatus: Task['status'] = 'todo'; // Default fallback
      if (['todo', 'in-progress', 'review', 'completed'].includes(task.status)) {
        validStatus = task.status as Task['status'];
      }
      
      // Ensure priority is one of the valid Task priority values
      let validPriority: Task['priority'] = 'medium'; // Default fallback
      if (['low', 'medium', 'high'].includes(task.priority)) {
        validPriority = task.priority as Task['priority'];
      }
      
      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: validStatus,
        assigneeId: task.assignee_id || '',
        dueDate: task.due_date || '',
        priority: validPriority,
        projectId: 'default-project', // Default value since this field isn't in the database
        isRecurring: false, // Default value since this isn't a recurring task
        recurringTaskId: null,
        assignee: task.profiles,
        completedAt: task.completed_at
      };
    });
  } catch (error: any) {
    console.error('Erro ao buscar tarefas por departamento:', error.message);
    return [];
  }
};

// =========== Funções de atualização de tarefas ===========

/**
 * Atualiza o status de uma tarefa
 */
export const updateTaskStatus = async (taskId: string, newStatus: string): Promise<boolean> => {
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

/**
 * Atualiza o status de uma instância de tarefa recorrente
 */
export const updateTaskInstanceStatus = async (instanceId: string, newStatus: string): Promise<boolean> => {
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

// =========== Funções de exclusão de tarefas ===========

/**
 * Exclui uma tarefa
 */
export const deleteTask = async (taskId: string): Promise<boolean> => {
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

/**
 * Exclui uma tarefa recorrente e todas as suas instâncias
 */
export const deleteRecurringTask = async (recurringTaskId: string): Promise<boolean> => {
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

// =========== Funções de criação de tarefas ===========

/**
 * Adiciona uma nova tarefa
 */
export const addTask = async (taskData: {
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  responsavel: string;
  dataVencimento: string;
}): Promise<boolean> => {
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

    if (error) {
      if (error.message.includes("does not exist")) {
        console.error("A tabela 'tasks' não existe no banco de dados");
      }
      throw error;
    }
    return true;
  } catch (error: any) {
    console.error('Erro ao adicionar tarefa:', error.message);
    throw error;
  }
};

/**
 * Adiciona uma nova tarefa recorrente e sua primeira instância
 */
export const addRecurringTask = async (taskData: {
  title: string;
  description: string;
  assigneeId: string;
  startDate: string;
  endDate?: string;
  recurrenceType: string;
  customDays?: number[];
  priority: string;
}): Promise<boolean> => {
  try {
    // Insert recurring task
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([{
        title: taskData.title,
        description: taskData.description,
        assignee_id: taskData.assigneeId,
        recurrence_type: taskData.recurrenceType,
        start_date: taskData.startDate,
        end_date: taskData.endDate || null,
        custom_days: taskData.customDays
      }])
      .select();

    if (error) throw error;

    // Create first instance
    const { error: instanceError } = await supabase
      .from('task_instances')
      .insert([{
        title: taskData.title,
        description: taskData.description,
        assignee_id: taskData.assigneeId,
        due_date: taskData.startDate,
        status: 'todo',
        priority: taskData.priority,
        recurring_task_id: data?.[0]?.id
      }]);

    if (instanceError) {
      console.error('Erro ao adicionar instância de tarefa:', instanceError);
    }

    // Update last_generated in recurring task
    const { error: updateError } = await supabase
      .from('recurring_tasks')
      .update({
        last_generated: new Date().toISOString()
      })
      .eq('id', data?.[0]?.id);
      
    if (updateError) {
      console.error('Erro ao atualizar data de última geração:', updateError);
    }

    return true;
  } catch (error: any) {
    console.error('Erro ao adicionar tarefa recorrente:', error.message);
    throw error;
  }
};

// =========== Funções de tarefas recorrentes ===========

/**
 * Busca tarefas recorrentes com suas instâncias
 */
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
        priority: instance.priority as TaskInstance['priority'],
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

/**
 * Cria uma nova instância para uma tarefa recorrente
 */
export const createNewTaskInstance = async (task: any, recurringData: any) => {
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
      console.error('Error creating new task instance:', insertError);
      return null;
    }
    
    // Update last_generated in recurring task
    const { error: updateError } = await supabase
      .from('recurring_tasks')
      .update({
        last_generated: today.toISOString()
      })
      .eq('id', task.recurring_task_id);
      
    if (updateError) {
      console.error('Error updating last generation date:', updateError);
    }
    
    return newInstance?.[0];
  } catch (error) {
    console.error('Error creating new task instance:', error);
    return null;
  }
};

/**
 * Processa uma tarefa concluída e cria novas instâncias se necessário
 */
export const processCompletedTask = async (task: any) => {
  try {
    if (!task.recurring_task_id) return;
    
    // Check if recurring task is still active
    const { data: recurringData, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', task.recurring_task_id)
      .single();
      
    if (recurringError) {
      console.error('Error fetching recurring task:', recurringError);
      return;
    }
    
    if (!recurringData) return;
    
    // Check if task hasn't expired
    if (recurringData.end_date && new Date(recurringData.end_date) < new Date()) {
      return;
    }
    
    // Create new instance for today
    const newInstance = await createNewTaskInstance(task, recurringData);
    
    // Log activity
    await logTaskRegeneration(task);
    
    return newInstance;
  } catch (error) {
    console.error('Error processing completed task:', error);
    return null;
  }
};

/**
 * Registra atividade de regeneração de tarefa
 */
export const logTaskRegeneration = async (task: any) => {
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
    console.error('Error logging task regeneration:', error);
  }
};

/**
 * Reseta tarefas recorrentes concluídas
 */
export const resetCompletedRecurringTasks = async (): Promise<boolean> => {
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
    console.error('Error resetting recurring tasks:', error.message);
    return false;
  }
};
