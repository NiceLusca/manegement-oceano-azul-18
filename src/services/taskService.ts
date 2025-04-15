
import { supabase } from '@/integrations/supabase/client';

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
