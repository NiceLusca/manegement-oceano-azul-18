
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TeamMemberOverview } from './TeamMemberOverview';
import { getTasksByAssignee } from '@/data/mock-data';

interface TeamMembersListProps {
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    department: string;
    status: string;
  }>;
  isAdmin: boolean;
  isManager: boolean;
  getDepartmentColor: (departmentName: string) => string | null;
}

export const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  members, 
  isAdmin, 
  isManager, 
  getDepartmentColor
}) => {
  const [showAll, setShowAll] = useState(false);
  
  const filteredMembers = members
    .filter(member => member.status === 'active')
    .slice(0, showAll ? undefined : 5);
  
  // Mapeamento dos membros da equipe que são líderes (para exibir o ícone de estrela)
  const teamLeads = new Set(members.filter(member => member.role.toLowerCase().includes('lead')).map(member => member.id));
  
  return (
    <div className="space-y-4">
      {filteredMembers.map((member) => (
        <TeamMemberOverview
          key={member.id}
          member={member}
          departmentColor={getDepartmentColor(member.department)}
          tasks={getTasksByAssignee(member.id)}
          isAdmin={isAdmin}
          isManager={isManager}
          teamLeads={teamLeads}
        />
      ))}
      
      {members.filter(member => member.status === 'active').length > 5 && (
        <Button 
          variant="ghost" 
          className="w-full text-muted-foreground" 
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Mostrar menos" : "Ver todos os membros"}
        </Button>
      )}
    </div>
  );
};
