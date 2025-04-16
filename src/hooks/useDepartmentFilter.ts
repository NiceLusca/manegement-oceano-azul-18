
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDepartmentFilter() {
  const [departments, setDepartments] = useState<{id: string, nome: string, cor: string | null}[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Buscar todos os departamentos
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('departamentos')
          .select('id, nome, cor')
          .order('nome');
          
        if (error) throw error;
        
        setDepartments(data || []);
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartments();
  }, []);
  
  // Verificar se o usuário tem restrição de departamento pelo perfil
  useEffect(() => {
    const checkUserDepartment = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('departamento_id, nivel_acesso')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Se o usuário não for admin/supervisor e tiver um departamento atribuído,
        // pré-selecionar esse departamento e não permitir alteração
        if (data && 
            data.departamento_id && 
            data.nivel_acesso !== 'Admin' && 
            data.nivel_acesso !== 'SuperAdmin' && 
            data.nivel_acesso !== 'Supervisor') {
          setSelectedDepartment(data.departamento_id);
        }
      } catch (error) {
        console.error('Erro ao verificar departamento do usuário:', error);
      }
    };
    
    checkUserDepartment();
  }, [user]);
  
  // Retornar os dados e funções necessárias
  return {
    departments,
    selectedDepartment,
    setSelectedDepartment,
    loading,
    // Função auxiliar para obter a cor do departamento
    getDepartmentColor: (departmentId: string) => {
      const dept = departments.find(d => d.id === departmentId);
      return dept?.cor || null;
    },
    // Função auxiliar para obter o nome do departamento
    getDepartmentName: (departmentId: string) => {
      const dept = departments.find(d => d.id === departmentId);
      return dept?.nome || 'Sem departamento';
    }
  };
}
