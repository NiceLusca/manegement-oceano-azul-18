
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { formatMembersData } from './teamUtils';

export const useFetchTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using the profiles table with the RLS policies now properly set
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      
      // Map Supabase data to TeamMember interface format
      const formattedMembers = formatMembersData(data || []);
      
      setTeamMembers(formattedMembers);
    } catch (error: any) {
      console.error('Erro ao buscar equipe:', error.message);
      setError(`Erro ao carregar equipe: ${error.message}`);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a equipe: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    teamMembers,
    loading,
    error,
    fetchTeamMembers,
    setTeamMembers
  };
};
