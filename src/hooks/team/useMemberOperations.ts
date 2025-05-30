
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EditMemberFormData } from './types';
import { buildUpdateData } from './teamUtils';

export const useMemberOperations = (userAccess: string | null, refreshData: () => void) => {
  const { toast } = useToast();

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
    updateMember,
    deleteMember
  };
};
