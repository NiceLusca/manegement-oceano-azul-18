
import { supabase } from '@/integrations/supabase/client';

// Basic task status update
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
      console.error('Erro ao atualizar status da tarefa:', error);
      return false;
    }
    
    // Registrar a atividade no histórico - for now, let's just log it
    try {
      console.log('Tarefa atualizada:', {
        taskId: taskId,
        newStatus: newStatus,
        timestamp: new Date().toISOString()
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
