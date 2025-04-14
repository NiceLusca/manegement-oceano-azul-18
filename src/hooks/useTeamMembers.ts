
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  nome: string;
}

export interface MemberFormData {
  nome: string;
  cargo: string;
  departamento: string;
  avatar_url: string;
}

export interface EditMemberFormData extends MemberFormData {
  id: string;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departamentos, setDepartamentos] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
    fetchDepartamentos();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      
      // Mapear os dados do Supabase para o formato da interface TeamMember
      const formattedMembers: TeamMember[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.nome || 'Sem nome',
        role: profile.cargo || 'Colaborador',
        email: '',  // O Supabase não armazena emails no perfil
        avatar: profile.avatar_url || '',
        department: profile.departamento_id || '',
        status: 'active' as 'active' | 'inactive', // Definindo como 'active' para corresponder ao tipo esperado
        joinedDate: profile.created_at
      }));
      
      setTeamMembers(formattedMembers);
    } catch (error: any) {
      console.error('Erro ao buscar equipe:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a equipe: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('departamentos')
        .select('*');

      if (error) throw error;
      
      setDepartamentos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar departamentos:', error.message);
    }
  };

  const addMember = async (memberData: MemberFormData) => {
    if (!memberData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do membro é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: crypto.randomUUID(), // Generate a unique ID
            nome: memberData.nome,
            cargo: memberData.cargo,
            departamento_id: memberData.departamento,
            avatar_url: memberData.avatar_url,
            nivel_acesso: 'user', // Default access level
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Novo membro adicionado com sucesso!",
        variant: "default"
      });

      // Recarregar a lista de membros
      fetchTeamMembers();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro: " + error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const updateMember = async (memberData: EditMemberFormData) => {
    if (!memberData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do membro é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: memberData.nome,
          cargo: memberData.cargo,
          departamento_id: memberData.departamento,
          avatar_url: memberData.avatar_url
        })
        .eq('id', memberData.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso!",
        variant: "default"
      });

      // Recarregar a lista de membros
      fetchTeamMembers();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar membro:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro: " + error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso!",
        variant: "default"
      });

      // Recarregar a lista de membros
      fetchTeamMembers();
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir membro:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o membro: " + error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departamentos.find(d => d.id === departmentId);
    return department ? department.nome : 'Sem departamento';
  };

  return {
    teamMembers,
    departamentos,
    loading,
    fetchTeamMembers,
    addMember,
    updateMember,
    deleteMember,
    getDepartmentName
  };
};
