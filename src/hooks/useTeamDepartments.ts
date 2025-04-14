
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  nome: string;
  cor: string | null;
}

export const useTeamDepartments = () => {
  const [departamentos, setDepartamentos] = useState<Record<string, Department>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const { data } = await supabase
          .from('departamentos')
          .select('*');
        
        if (data) {
          const depMap = data.reduce((acc: Record<string, Department>, dep) => {
            acc[dep.id] = dep;
            return acc;
          }, {});
          setDepartamentos(depMap);
        }
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartamentos();
  }, []);

  // Função para obter a cor do departamento
  const getDepartmentColor = (departmentName: string) => {
    const department = Object.values(departamentos).find(d => d.nome === departmentName);
    return department?.cor || null;
  };

  return {
    departamentos,
    loading,
    getDepartmentColor
  };
};
