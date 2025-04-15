
import React from 'react';
import { TeamMember } from '@/types';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { DepartmentTeamView } from '@/components/team/DepartmentTeamView';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

interface TeamTabsProps {
  viewMode: 'all' | 'departments';
  setViewMode: React.Dispatch<React.SetStateAction<'all' | 'departments'>>;
  loading: boolean;
  loadingDepartments: boolean;
  teamMembers: TeamMember[];
  teamByDepartment: any[];
  getDepartmentName: (departmentId: string) => string;
  canEditMember: (memberId: string) => boolean;
  canDeleteMember: (memberId: string) => boolean;
  openEditDialogForMember: (member: TeamMember) => void;
  openDeleteDialogForMember: (memberId: string) => void;
}

export const TeamTabs: React.FC<TeamTabsProps> = ({
  viewMode,
  setViewMode,
  loading,
  loadingDepartments,
  teamMembers,
  teamByDepartment,
  getDepartmentName,
  canEditMember,
  canDeleteMember,
  openEditDialogForMember,
  openDeleteDialogForMember
}) => {
  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setViewMode(value as 'all' | 'departments')}>
      <TabsList className="mb-4">
        <TabsTrigger value="all">Todos os Membros</TabsTrigger>
        <TabsTrigger value="departments">Por Departamento</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando membros da equipe...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                departmentName={getDepartmentName(member.department)}
                onEdit={openEditDialogForMember}
                onDelete={openDeleteDialogForMember}
                canEdit={canEditMember(member.id)}
                canDelete={canDeleteMember(member.id)}
              />
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="departments">
        {loadingDepartments ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando departamentos...</p>
          </div>
        ) : (
          <DepartmentTeamView
            departmentsData={teamByDepartment}
            onEditMember={openEditDialogForMember}
            onDeleteMember={openDeleteDialogForMember}
            canEditMember={canEditMember}
            canDeleteMember={canDeleteMember}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};
