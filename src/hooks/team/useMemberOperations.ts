import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MemberFormData, EditMemberFormData } from './types';
import { buildUpdateData } from './teamUtils';

export const useMemberOperations = (userAccess: string | null, refreshData: () => void) => {
  const { toast } = useToast();

  // Add a new member
  const addMember = useCallback(async (memberData: MemberFormData) => {
    if (!memberData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do membro é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Generate a UUID for the profile
      const newMemberId = crypto.randomUUID();
      
      // Create a user account first if required by your auth system
      // For profile-only operations, we would need to:
      // 1. Check if the user account exists in auth.users
      // 2. Only then create a profile linked to that user

      // For this fix, we need to explicitly set the ID field since it's required by the TypeScript type
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: newMemberId, // This is the required field
          nome: memberData.nome,
          cargo: memberData.cargo || 'Colaborador',
          departamento_id: memberData.departamento || null,
          avatar_url: memberData.avatar_url || null,
          nivel_acesso: memberData.nivel_acesso || 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Novo membro adicionado com sucesso!",
        variant: "default"
      });

      // Reload the team members list
      refreshData();
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
  }, [toast, refreshData]);

  // Update an existing member
  const updateMember = useCallback(async (memberData: EditMemberFormData) => {
    if (!memberData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do membro é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    try {
      const updateData = buildUpdateData(memberData, userAccess);
      
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

      // Reload the team members list
      refreshData();
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
  }, [toast, refreshData, userAccess]);

  // Delete a member
  const deleteMember = useCallback(async (memberId: string) => {
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

      // Reload the team members list
      refreshData();
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
  }, [toast, refreshData]);

  return {
    addMember,
    updateMember,
    deleteMember
  };
};
