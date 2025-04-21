
import { Task } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { addActivityEntry } from '@/services/teamActivityService';

// Função para registrar a atividade no histórico
export const logTaskActivity = async (task: Task, newStatus: string) => {
  try {
    const currentUser = supabase.auth.getUser();
    const userId = (await currentUser).data.user?.id || 'anonymous';

    await addActivityEntry({
      user_id: userId,
      action: 'update_status',
      entity_type: 'task',
      entity_id: task.id,
      details: JSON.stringify({
        taskTitle: task.title,
        oldStatus: task.status,
        newStatus: newStatus
      })
    });
  } catch (error) {
    console.error('Erro ao registrar atividade no histórico:', error);
  }
};
