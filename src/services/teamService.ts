
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';

export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;
    
    const formattedMembers: TeamMember[] = (data || []).map(profile => ({
      id: profile.id,
      name: profile.nome || 'Sem nome',
      role: profile.cargo || 'Colaborador',
      email: '',
      avatar: profile.avatar_url || '',
      department: profile.departamento_id || '',
      status: 'active' as 'active' | 'inactive',
      joinedDate: profile.created_at
    }));
    
    return formattedMembers;
  } catch (error: any) {
    console.error('Erro ao buscar equipe:', error.message);
    const { teamMembers } = await import('@/data/mock-data');
    return teamMembers;
  }
};
