import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { useToast } from '@/components/ui/use-toast';

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
      
    if (error) {
      if (error.message.includes("does not exist")) {
        console.error("A tabela 'tasks' não existe no banco de dados");
      }
      throw error;
    }
    
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
      
    if (error) {
      if (error.message.includes("does not exist")) {
        console.error("A tabela 'tasks' não existe no banco de dados");
        return [];
      }
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Erro ao buscar tarefas por departamento:', error.message);
    return [];
  }
};

// Buscar tarefas com detalhes expandidos (incluindo informações do responsável)
export const getTasksWithDetails = async () => {
  try {
    // Buscar tarefas regulares
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
    
    // Buscar também instâncias de tarefas recorrentes
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
    
    // Formatar as tarefas regulares
    const formattedRegularTasks = (regularTasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status as 'todo' | 'in-progress' | 'review' | 'completed',
      assigneeId: task.assignee_id || '',
      dueDate: task.due_date || new Date().toISOString(),
      priority: task.priority as 'low' | 'medium' | 'high',
      assignee: task.assignee,
      projectId: 'default-category',
      isRecurring: false
    }));
    
    // Formatar as instâncias de tarefas recorrentes
    const formattedInstanceTasks = (instanceTasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status as 'todo' | 'in-progress' | 'review' | 'completed',
      assigneeId: task.assignee_id || '',
      dueDate: task.due_date || new Date().toISOString(),
      priority: task.priority as 'low' | 'medium' | 'high',
      assignee: task.assignee,
      projectId: 'default-category',
      isRecurring: true,
      recurringTaskId: task.recurring_task_id
    }));
    
    // Combinar ambos os tipos de tarefas
    return [...formattedRegularTasks, ...formattedInstanceTasks];
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

    if (error) {
      if (error.message.includes("does not exist")) {
        console.error("A tabela 'recurring_tasks' não existe no banco de dados");
      }
      throw error;
    }

    // Também criar a primeira instância da tarefa
    const { error: instanceError } = await supabase
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

    if (instanceError) {
      if (instanceError.message.includes("does not exist")) {
        console.error("A tabela 'task_instances' não existe no banco de dados");
      }
      console.error('Erro ao adicionar instância de tarefa:', instanceError);
    }

    return true;
  } catch (error: any) {
    console.error('Erro ao adicionar tarefa recorrente:', error.message);
    throw error;
  }
};

// Function to reset completed recurring tasks to 'todo' status
export const resetCompletedRecurringTasks = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Fetch recurring tasks that were completed yesterday
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
    
    // For each completed task, create a new instance for today
    for (const task of data || []) {
      // Check if the recurring task is still active
      const { data: recurringData, error: recurringError } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('id', task.recurring_task_id)
        .single();
        
      if (recurringError) {
        console.error('Erro ao buscar tarefa recorrente:', recurringError);
        continue;
      }
      
      // Check if the recurring task has not expired
      if (recurringData.end_date && new Date(recurringData.end_date) < new Date()) {
        continue;
      }
      
      // Create a new instance of the task for today
      const today = new Date();
      const { error: insertError } = await supabase
        .from('task_instances')
        .insert([
          {
            title: task.title,
            description: task.description,
            assignee_id: task.assignee_id,
            due_date: today.toISOString(),
            status: 'todo',
            priority: task.priority,
            recurring_task_id: task.recurring_task_id
          }
        ]);
        
      if (insertError) {
        console.error('Erro ao criar nova instância de tarefa:', insertError);
      }
      
      // Log the task regeneration in history
      try {
        await supabase
          .from('team_activity_view')
          .insert([
            {
              user_id: task.assignee_id,
              action: 'regenerate_task',
              entity_type: 'task',
              entity_id: task.recurring_task_id,
              details: `Tarefa recorrente "${task.title}" regenerada automaticamente`
            }
          ]);
      } catch (historyError) {
        console.error('Erro ao registrar no histórico:', historyError);
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('Erro ao resetar tarefas recorrentes:', error.message);
    return false;
  }
};
