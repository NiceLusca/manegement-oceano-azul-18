
import { supabase } from '@/integrations/supabase/client';

export const fetchDepartamentos = async (): Promise<{id: string, nome: string}[]> => {
  try {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*');

    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Erro ao buscar departamentos:', error.message);
    return [];
  }
};
