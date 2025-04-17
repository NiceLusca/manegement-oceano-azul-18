
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useTeamDepartments } from '@/hooks/useTeamDepartments';
import { TeamMembersList } from '@/components/team/TeamMembersList';
import { Loader2 } from 'lucide-react';

export function TeamOverview() {
  const [nivelAcesso] = React.useState("admin"); // Em uma aplicação real, viria de um contexto de autenticação
  const { departamentos, getDepartmentColor } = useTeamDepartments();
  
  const { teamMembers, loading, error } = useTeamMembers();
  
  const isAdmin = nivelAcesso === "admin";
  const isManager = nivelAcesso === "admin" || nivelAcesso === "manager";
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-destructive">Erro ao carregar equipe: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros da Equipe</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando equipe...</span>
          </div>
        ) : (
          <TeamMembersList 
            members={teamMembers}
            isAdmin={isAdmin}
            isManager={isManager}
            getDepartmentColor={getDepartmentColor}
          />
        )}
      </CardContent>
    </Card>
  );
}
