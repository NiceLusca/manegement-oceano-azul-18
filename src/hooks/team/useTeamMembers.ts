
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchTeamMembers } from './useFetchTeamMembers';
import { useFetchDepartments } from './useFetchDepartments';
import { useMemberOperations } from './useMemberOperations';
import { 
  getDepartmentName as getDepartmentNameUtil,
  fetchUserAccessLevel,
  isUserSuperAdmin,
  canEditMember as canEditMemberAsync,
  canAddMembers as canAddMembersAsync,
  canDeleteMember as canDeleteMemberAsync
} from './teamUtils';
import type { MemberFormData, EditMemberFormData, UseTeamMembersReturn } from './types';
import { useToast } from '@/hooks/use-toast';

export const useTeamMembers = (): UseTeamMembersReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userAccess, setUserAccess] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [canEditPermissions, setCanEditPermissions] = useState<Record<string, boolean>>({});
  const [canDeletePermissions, setCanDeletePermissions] = useState<Record<string, boolean>>({});
  const [canAddMembersValue, setCanAddMembersValue] = useState(false);
  
  const { 
    teamMembers, 
    loading, 
    error, 
    fetchTeamMembers 
  } = useFetchTeamMembers();
  
  const { 
    departamentos, 
    fetchDepartamentos 
  } = useFetchDepartments();

  const { 
    addMember, 
    updateMember, 
    deleteMember 
  } = useMemberOperations(userAccess, fetchTeamMembers);

  // Check if user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (user?.id) {
        try {
          const result = await isUserSuperAdmin(user.id);
          setIsSuperAdmin(result);
        } catch (error) {
          console.error('Error checking super admin status:', error);
          setIsSuperAdmin(false);
        }
      } else {
        setIsSuperAdmin(false);
      }
    };
    
    checkSuperAdmin();
  }, [user]);

  // Fetch user access level
  useEffect(() => {
    const getUserAccessLevel = async () => {
      if (user?.id) {
        try {
          const accessLevel = await fetchUserAccessLevel(user.id);
          setUserAccess(accessLevel);
          
          if (accessLevel === 'SuperAdmin') {
            toast({
              title: "SuperAdmin",
              description: "Você está acessando como Super Administrador",
              variant: "default"
            });
          }
        } catch (error) {
          console.error('Error fetching user access level:', error);
          setUserAccess('user'); // Fallback to basic user access
        }
      } else {
        setUserAccess(null);
      }
    };
    
    getUserAccessLevel();
  }, [user, toast]);

  // Fetch team members and departments
  useEffect(() => {
    fetchTeamMembers();
    fetchDepartamentos();
  }, [fetchTeamMembers, fetchDepartamentos]);

  // Pre-compute permissions for all team members
  useEffect(() => {
    const updatePermissions = async () => {
      if (!user?.id || !teamMembers.length) return;
      
      // Check add members permission
      const canAdd = await canAddMembersAsync(user.id);
      setCanAddMembersValue(canAdd);
      
      // Check edit permissions for each member
      const editPerms: Record<string, boolean> = {};
      const deletePerms: Record<string, boolean> = {};
      
      for (const member of teamMembers) {
        editPerms[member.id] = await canEditMemberAsync(member.id, user.id);
        deletePerms[member.id] = await canDeleteMemberAsync(user.id, member.id);
      }
      
      setCanEditPermissions(editPerms);
      setCanDeletePermissions(deletePerms);
    };
    
    updatePermissions();
  }, [user, teamMembers]);

  const getDepartmentName = useCallback((departmentId: string) => {
    return getDepartmentNameUtil(departmentId, departamentos);
  }, [departamentos]);

  const canEditMember = useCallback((memberId: string) => {
    return canEditPermissions[memberId] || false;
  }, [canEditPermissions]);

  const canAddMembers = useCallback(() => {
    return canAddMembersValue;
  }, [canAddMembersValue]);

  const canDeleteMember = useCallback((memberId: string) => {
    return canDeletePermissions[memberId] || false;
  }, [canDeletePermissions]);

  return {
    teamMembers,
    departamentos,
    loading,
    userAccess,
    error,
    fetchTeamMembers,
    addMember,
    updateMember,
    deleteMember,
    getDepartmentName,
    canEditMember,
    canAddMembers,
    canDeleteMember
  };
};
