
import { supabase } from '@/integrations/supabase/client';
import { Department, EditMemberFormData } from './types';
import { TeamMember } from '@/types';

// Format members data received from Supabase
export const formatMembersData = (data: any[]): TeamMember[] => {
  return (data || []).map(profile => {
    const accessLevel = profile.nivel_acesso as 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user' | undefined;
    
    return {
      id: profile.id,
      name: profile.nome || 'Sem nome',
      role: profile.cargo || 'Colaborador',
      email: '',  // The Supabase does not store emails in the profile
      avatar: profile.avatar_url || '',
      department: profile.departamento_id || '',
      status: 'active' as 'active' | 'inactive',
      joinedDate: profile.created_at,
      accessLevel: accessLevel || 'user'
    };
  });
};

// Get department name by ID
export const getDepartmentName = (departmentId: string, departments: Department[]) => {
  const department = departments.find(d => d.id === departmentId);
  return department ? department.nome : 'Sem departamento';
};

// Build update data based on user access level
export const buildUpdateData = (memberData: EditMemberFormData, currentUserAccess: string | null) => {
  const updateData: any = {
    nome: memberData.nome,
    cargo: memberData.cargo,
    departamento_id: memberData.departamento,
    avatar_url: memberData.avatar_url
  };
  
  // Only SuperAdmin and Admin users can change access level
  if ((currentUserAccess === 'SuperAdmin' || currentUserAccess === 'Admin') && memberData.nivel_acesso) {
    // SuperAdmin can promote any level
    if (currentUserAccess === 'SuperAdmin') {
      updateData.nivel_acesso = memberData.nivel_acesso;
    } 
    // Admin cannot promote to SuperAdmin
    else if (currentUserAccess === 'Admin' && memberData.nivel_acesso !== 'SuperAdmin') {
      updateData.nivel_acesso = memberData.nivel_acesso;
    }
  }
  
  return updateData;
};

// Check if user can edit a member
export const canEditMember = (
  memberId: string, 
  userId: string | undefined, 
  userAccess: string | null, 
  teamMembers: TeamMember[]
) => {
  if (!userId || !userAccess) return false;
  
  // SuperAdmin and Admin can edit any member
  if (userAccess === 'SuperAdmin' || userAccess === 'Admin') {
    return true;
  }
  
  // Supervisor can only edit members of their department
  if (userAccess === 'Supervisor') {
    const supervisor = teamMembers.find(m => m.id === userId);
    const targetMember = teamMembers.find(m => m.id === memberId);
    
    return supervisor && targetMember && supervisor.department === targetMember.department;
  }
  
  // Regular users can only edit themselves
  return userId === memberId;
};

// Check if user can add new members
export const canAddMembers = (userAccess: string | null) => {
  return userAccess === 'SuperAdmin' || userAccess === 'Admin';
};

// Check if user can delete members
export const canDeleteMember = (userAccess: string | null) => {
  return userAccess === 'SuperAdmin' || userAccess === 'Admin';
};

// Fetch user access level
export const fetchUserAccessLevel = async (userId: string | undefined) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('nivel_acesso')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data?.nivel_acesso || 'user';
  } catch (error: any) {
    console.error('Erro ao buscar nível de acesso:', error.message);
    return 'user'; // Default in case of error
  }
};
