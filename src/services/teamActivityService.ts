
import { supabase } from '@/integrations/supabase/client';

export interface ActivityEntry {
  id?: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
}

export const addActivityEntry = async (activity: ActivityEntry): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('team_activity')
      .insert({
        user_id: activity.user_id,
        action: activity.action,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        details: activity.details
      });
      
    if (error) {
      if (error.message.includes('does not exist')) {
        console.warn('A tabela team_activity não existe ainda. Atividade será apenas registrada no console.');
        console.log('Atividade registrada:', activity);
        return true;
      }
      console.error('Erro ao registrar atividade:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    return false;
  }
};

export const getActivityHistory = async (limit: number = 50): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('team_activity_view')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      if (error.message.includes('does not exist')) {
        console.warn('A view team_activity_view não existe ainda. Retornando array vazio.');
        return [];
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico de atividades:', error);
    return [];
  }
};
