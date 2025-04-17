
import { TeamMember } from '@/types';

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

export interface UseTeamMembersReturn {
  teamMembers: TeamMember[];
  departamentos: Department[];
  loading: boolean;
  userAccess: string | null;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
  addMember: (memberData: MemberFormData) => Promise<boolean>;
  updateMember: (memberData: EditMemberFormData) => Promise<boolean>;
  deleteMember: (memberId: string) => Promise<boolean>;
  getDepartmentName: (departmentId: string) => string;
  canEditMember: (member: TeamMember) => boolean; // Updated type
  canAddMembers: () => boolean; // This remains a function returning a boolean
  canDeleteMember: (member: TeamMember) => boolean; // Updated type
}
