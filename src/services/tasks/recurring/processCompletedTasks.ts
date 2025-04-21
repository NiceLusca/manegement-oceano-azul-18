
import { supabase } from '@/integrations/supabase/client';
import { addActivityEntry } from '@/services/teamActivityService';
import { createNewTaskInstance } from './createTaskInstance';

// Process completed task instances and create new ones if needed
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

// Helper function to log task regeneration
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
