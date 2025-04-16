import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';

// Atualizar o status de uma tarefa (usado no sistema de arrastar e soltar)
export const updateTaskStatus = async (taskId: string, newStatus: string) => {
  try {
    // Validar status
    if (!['todo', 'in-progress', 'review', 'completed'].includes(newStatus)) {
      throw new Error('Status inválido');
    }
    
    // Se a tarefa estiver sendo marcada como concluída, registrar a data de conclusão
    const updates: any = { 
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    // Atualizar no banco de dados
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);
      
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Erro ao atualizar status da tarefa:', error.message);
    return false;
  }
};

// Buscar tarefas por departamento
export const getTasksByDepartment = async (departmentId: string) => {
  try {
    // Esta consulta é mais complexa e requer JOIN
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles:assignee_id (
          departamento_id
        )
      `)
      .eq('profiles.departamento_id', departmentId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Erro ao buscar tarefas por departamento:', error.message);
    return [];
  }
};

// Buscar tarefas com detalhes expandidos (incluindo informações do responsável)
export const getTasksWithDetails = async () => {
  try {
    const { data, error } = await supabase
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
      
    if (error) throw error;
    
    // Formatar os dados para o formato esperado pelo frontend
    const formattedTasks = data?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status as 'todo' | 'in-progress' | 'review' | 'completed',
      assigneeId: task.assignee_id || '',
      dueDate: task.due_date || new Date().toISOString(),
      priority: task.priority as 'low' | 'medium' | 'high',
      assignee: task.assignee,
      projectId: 'default-category'
    })) || [];
    
    return formattedTasks;
  } catch (error: any) {
    console.error('Erro ao buscar tarefas com detalhes:', error.message);
    return [];
  }
};

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

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erro ao adicionar tarefa:', error.message);
    throw error;
  }
};

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
    // Inserir a tarefa recorrente
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([
        {
          title: taskData.title,
          description: taskData.description,
          assignee_id: taskData.assigneeId,
          recurrence_type: taskData.recurrenceType,
          start_date: taskData.startDate ? new Date(taskData.startDate).toISOString() : new Date().toISOString(),
          end_date: taskData.endDate ? new Date(taskData.endDate).toISOString() : null,
          custom_days: taskData.customDays
        }
      ])
      .select();

    if (error) throw error;

    // Também criar a primeira instância da tarefa
    await supabase
      .from('task_instances')
      .insert([
        {
          title: taskData.title,
          description: taskData.description,
          assignee_id: taskData.assigneeId,
          due_date: taskData.startDate ? new Date(taskData.startDate).toISOString() : new Date().toISOString(),
          status: 'todo',
          priority: taskData.priority,
          recurring_task_id: data?.[0]?.id
        }
      ]);

    return true;
  } catch (error: any) {
    console.error('Erro ao adicionar tarefa recorrente:', error.message);
    throw error;
  }
};
