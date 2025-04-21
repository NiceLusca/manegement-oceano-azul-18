
import { supabase } from '@/integrations/supabase/client';

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
