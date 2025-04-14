
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Department {
  id: string;
  nome: string;
}

export interface MemberFormData {
  nome: string;
  cargo: string;
  departamento: string;
  avatar_url: string;
  nivel_acesso?: 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user';
}

export interface EditMemberFormData extends MemberFormData {
  id: string;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departamentos, setDepartamentos] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAccess, setUserAccess] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUserAccessLevel();
  }, [user]);

  useEffect(() => {
    if (userAccess) {
      fetchTeamMembers();
      fetchDepartamentos();
    }
  }, [userAccess]);

  const fetchUserAccessLevel = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nivel_acesso')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setUserAccess(data?.nivel_acesso || 'user');
    } catch (error: any) {
      console.error('Erro ao buscar nível de acesso:', error.message);
      setUserAccess('user'); // Padrão caso ocorra erro
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // As políticas RLS já aplicam as restrições de visualização
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
        joinedDate: profile.created_at,
        accessLevel: profile.nivel_acesso || 'user'
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
            nivel_acesso: memberData.nivel_acesso || 'user',
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
      const updateData: any = {
        nome: memberData.nome,
        cargo: memberData.cargo,
        departamento_id: memberData.departamento,
        avatar_url: memberData.avatar_url
      };
      
      // Apenas usuários SuperAdmin e Admin podem alterar nível de acesso
      if ((userAccess === 'SuperAdmin' || userAccess === 'Admin') && memberData.nivel_acesso) {
        // SuperAdmin pode promover qualquer nível
        if (userAccess === 'SuperAdmin') {
          updateData.nivel_acesso = memberData.nivel_acesso;
        } 
        // Admin não pode promover para SuperAdmin
        else if (userAccess === 'Admin' && memberData.nivel_acesso !== 'SuperAdmin') {
          updateData.nivel_acesso = memberData.nivel_acesso;
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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

  // Verificar se o usuário atual tem permissão para editar um membro
  const canEditMember = (memberId: string) => {
    if (!user || !userAccess) return false;
    
    // SuperAdmin e Admin podem editar qualquer membro
    if (userAccess === 'SuperAdmin' || userAccess === 'Admin') {
      return true;
    }
    
    // Supervisor só pode editar membros do seu departamento
    if (userAccess === 'Supervisor') {
      const supervisor = teamMembers.find(m => m.id === user.id);
      const targetMember = teamMembers.find(m => m.id === memberId);
      
      return supervisor && targetMember && supervisor.department === targetMember.department;
    }
    
    // Usuário comum só pode editar a si mesmo
    return user.id === memberId;
  };

  return {
    teamMembers,
    departamentos,
    loading,
    userAccess,
    fetchTeamMembers,
    addMember,
    updateMember,
    deleteMember,
    getDepartmentName,
    canEditMember
  };
};
