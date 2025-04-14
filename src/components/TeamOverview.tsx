
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { teamMembers } from '@/data/mock-data';
import { useTeamDepartments } from '@/hooks/useTeamDepartments';
import { AddTeamMemberDialog } from '@/components/team/AddTeamMemberDialog';
import { TeamMembersList } from '@/components/team/TeamMembersList';

export function TeamOverview() {
  const [nivelAcesso] = React.useState("admin"); // Em uma aplicação real, viria de um contexto de autenticação
  const { departamentos, getDepartmentColor } = useTeamDepartments();
  const [openDialog, setOpenDialog] = useState(false);
  
  const isAdmin = nivelAcesso === "admin";
  const isManager = nivelAcesso === "admin" || nivelAcesso === "manager";
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Membros da Equipe</CardTitle>
        {isAdmin && (
          <AddTeamMemberDialog 
            open={openDialog} 
            onOpenChange={setOpenDialog} 
            departamentos={Object.values(departamentos)}
          />
        )}
      </CardHeader>
      <CardContent>
        <TeamMembersList 
          members={teamMembers}
          isAdmin={isAdmin}
          isManager={isManager}
          getDepartmentColor={getDepartmentColor}
        />
      </CardContent>
    </Card>
  );
}
