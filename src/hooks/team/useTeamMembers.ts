
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFetchTeamMembers } from './useFetchTeamMembers';
import { useFetchDepartments } from './useFetchDepartments';
import { useMemberOperations } from './useMemberOperations';
import { 
  getDepartmentName as getDepartmentNameUtil,
  canEditMember as canEditMemberUtil,
  canAddMembers as canAddMembersUtil,
  canDeleteMember as canDeleteMemberUtil,
  fetchUserAccessLevel,
  isUserSuperAdmin
} from './teamUtils';
import type { MemberFormData, EditMemberFormData, UseTeamMembersReturn } from './types';
import { useToast } from '@/hooks/use-toast';

// Re-export the type from types.ts
export type { MemberFormData, EditMemberFormData, UseTeamMembersReturn };

export const useTeamMembers = (): UseTeamMembersReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userAccess, setUserAccess] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
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

  useEffect(() => {
    fetchTeamMembers();
    fetchDepartamentos();
  }, [fetchTeamMembers, fetchDepartamentos]);

  const getDepartmentName = useCallback((departmentId: string) => {
    return getDepartmentNameUtil(departmentId, departamentos);
  }, [departamentos]);

  const canEditMember = useCallback((memberId: string) => {
    return canEditMemberUtil(memberId, user?.id, userAccess, teamMembers);
  }, [user, userAccess, teamMembers]);

  const canAddMembers = useCallback(() => {
    return canAddMembersUtil(userAccess);
  }, [userAccess]);

  const canDeleteMember = useCallback((memberId: string) => {
    return canDeleteMemberUtil(userAccess);
  }, [userAccess]);

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
