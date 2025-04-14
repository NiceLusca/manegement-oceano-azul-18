
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
  fetchUserAccessLevel
} from './teamUtils';
import type { MemberFormData, EditMemberFormData, UseTeamMembersReturn } from './types';

// Re-export the type from types.ts
export type { MemberFormData, EditMemberFormData, UseTeamMembersReturn };

export const useTeamMembers = (): UseTeamMembersReturn => {
  const { user } = useAuth();
  const [userAccess, setUserAccess] = useState<string | null>(null);
  
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

  useEffect(() => {
    const getUserAccessLevel = async () => {
      const accessLevel = await fetchUserAccessLevel(user?.id);
      setUserAccess(accessLevel);
    };
    
    getUserAccessLevel();
  }, [user]);

  useEffect(() => {
    if (userAccess) {
      fetchTeamMembers();
      fetchDepartamentos();
    }
  }, [userAccess, fetchTeamMembers, fetchDepartamentos]);

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
