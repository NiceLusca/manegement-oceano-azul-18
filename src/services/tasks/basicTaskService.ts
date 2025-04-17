
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
      if (error.message.includes("does not exist")) {
        console.error("A tabela 'tasks' não existe no banco de dados");
      }
      throw error;
    }
    
    // Registrar a atividade no histórico
    try {
      console.log('Atividade registrada:', {
        action: 'update_task_status',
        details: `Tarefa atualizada para ${newStatus}`
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
