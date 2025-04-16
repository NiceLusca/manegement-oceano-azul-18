
import { supabase } from '@/integrations/supabase/client';

export const fetchDepartamentos = async (): Promise<{id: string, nome: string, cor?: string}[]> => {
  try {
    const { data, error } = await supabase
      .from('departamentos')
      .select('id, nome, cor')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar departamentos:', error.message);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Erro ao buscar departamentos:', error.message);
    // Return an empty array instead of throwing to prevent UI breaking
    return [];
  }
};

export const getDepartmentColor = (departmentId: string, departments: {id: string, nome: string, cor?: string}[]): string => {
  const department = departments.find(d => d.id === departmentId);
  return department?.cor || '#94a3b8'; // fallback to slate-400
};

