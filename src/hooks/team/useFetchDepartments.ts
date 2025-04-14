
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Department } from './types';

export const useFetchDepartments = () => {
  const [departamentos, setDepartamentos] = useState<Department[]>([]);

  const fetchDepartamentos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('departamentos')
        .select('*');

      if (error) throw error;
      
      setDepartamentos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar departamentos:', error.message);
    }
  }, []);

  return {
    departamentos,
    fetchDepartamentos
  };
};
