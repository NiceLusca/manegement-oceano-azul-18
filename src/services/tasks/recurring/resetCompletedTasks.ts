
import { supabase } from '@/integrations/supabase/client';
import { processCompletedTask } from './processCompletedTasks';

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
    console.error('Error resetting recurring tasks:', error.message);
    return false;
  }
};
