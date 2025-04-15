
import { Customer, TeamMember } from '@/types';

export const mapCustomerFromDB = (item: any): Customer => ({
  id: item.id,
  name: item.name,
  origem: item.origem || '',
  email: item.email || '',
  phone: item.phone || '',
  status: (item.status || 'lead') as 'lead' | 'prospect' | 'customer' | 'churned',
  lastContact: item.last_contact || '',
  notes: item.notes || '',
  assignedTo: item.assigned_to || '',
  value: item.value || 0
});

export const mapTeamMemberFromDB = (member: any): TeamMember => {
  // Ensure accessLevel is one of the allowed values
  let accessLevel: 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user' = 'user';
  if (member.nivel_acesso === 'SuperAdmin' || 
      member.nivel_acesso === 'Admin' || 
      member.nivel_acesso === 'Supervisor') {
    accessLevel = member.nivel_acesso;
  }
  
  return {
    id: member.id,
    name: member.nome || 'Sem nome',
    role: member.cargo || 'Colaborador',
    email: '',
    avatar: member.avatar_url || '',
    department: '',
    status: 'active',
    joinedDate: '',
    accessLevel
  };
};
