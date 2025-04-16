
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

// Check if user can edit a member using the user's access level
export const canEditMember = async (
  memberId: string, 
  userId: string | undefined
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Get the user's access level using the secure RPC function
    const { data: accessLevel, error } = await supabase
      .rpc('get_user_nivel_acesso', { user_id: userId });
      
    if (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }
    
    // SuperAdmin can edit any member
    if (accessLevel === 'SuperAdmin') return true;
    
    // Admin cannot edit SuperAdmin
    if (accessLevel === 'Admin') {
      const { data, error: memberError } = await supabase
        .from('profiles')
        .select('nivel_acesso')
        .eq('id', memberId)
        .maybeSingle();
        
      if (memberError || !data) return false;
      return data.nivel_acesso !== 'SuperAdmin';
    }
    
    // Supervisor can only edit members of their department
    if (accessLevel === 'Supervisor') {
      const { data: userDept } = await supabase
        .rpc('get_user_department', { user_id: userId });
        
      if (!userDept) return false;
      
      const { data: memberDept } = await supabase
        .from('profiles')
        .select('departamento_id')
        .eq('id', memberId)
        .maybeSingle();
        
      return memberDept?.departamento_id === userDept;
    }
    
    // Regular users can only edit themselves
    return userId === memberId;
  } catch (error) {
    console.error('Error in canEditMember:', error);
    return false;
  }
};

// Check if user can add new members based on their access level
export const canAddMembers = async (userId: string | undefined): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data: accessLevel, error } = await supabase
      .rpc('get_user_nivel_acesso', { user_id: userId });
      
    if (error) {
      console.error('Error checking add permission:', error);
      return false;
    }
    
    // Only Admin and SuperAdmin can add members
    return accessLevel === 'Admin' || accessLevel === 'SuperAdmin';
  } catch (error) {
    console.error('Error in canAddMembers:', error);
    return false;
  }
};

// Check if user can delete members based on their access level
export const canDeleteMember = async (
  userId: string | undefined,
  memberId: string
): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data: accessLevel, error } = await supabase
      .rpc('get_user_nivel_acesso', { user_id: userId });
      
    if (error || !['Admin', 'SuperAdmin'].includes(accessLevel)) {
      return false;
    }
    
    // Check if target is a SuperAdmin (cannot delete SuperAdmin)
    const { data, error: memberError } = await supabase
      .from('profiles')
      .select('nivel_acesso')
      .eq('id', memberId)
      .maybeSingle();
      
    if (memberError || !data) return false;
    
    // Only SuperAdmin can delete other SuperAdmins
    if (data.nivel_acesso === 'SuperAdmin') {
      return accessLevel === 'SuperAdmin';
    }
    
    return true;
  } catch (error) {
    console.error('Error in canDeleteMember:', error);
    return false;
  }
};

// Fetch user access level with security definer function
export const fetchUserAccessLevel = async (userId: string | undefined) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .rpc('get_user_nivel_acesso', { user_id: userId });
      
    if (error) {
      console.error('Error fetching access level:', error.message);
      return 'user'; // Default access level on error
    }
    
    return data || 'user';
  } catch (error: any) {
    console.error('Error in fetchUserAccessLevel:', error.message);
    return 'user'; // Default in case of error
  }
};

// Verify SuperAdmin role using the access level function
export const isUserSuperAdmin = async (userId: string | undefined) => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .rpc('get_user_nivel_acesso', { user_id: userId });
      
    if (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
    
    return data === 'SuperAdmin';
  } catch (error) {
    console.error('Error in isUserSuperAdmin:', error);
    return false;
  }
};

// Get department color
export const getDepartmentColor = async (departmentId: string | null) => {
  if (!departmentId) return null;
  
  try {
    const { data, error } = await supabase
      .from('departamentos')
      .select('cor')
      .eq('id', departmentId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching department color:', error.message);
      return null;
    }
    
    return data?.cor || null;
  } catch (error) {
    console.error('Error in getDepartmentColor:', error);
    return null;
  }
};
