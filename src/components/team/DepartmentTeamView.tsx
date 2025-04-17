
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { TeamMember } from '@/types';

interface DepartmentTeamViewProps {
  teamByDepartment: any[];
  getDepartmentName: (departmentId: string) => string;
  canEditMember: (member: TeamMember) => boolean;
  canDeleteMember: (member: TeamMember) => boolean;
  openEditDialogForMember: (member: TeamMember) => void;
  openDeleteDialogForMember: (memberId: string) => void;
}

export const DepartmentTeamView: React.FC<DepartmentTeamViewProps> = ({
  teamByDepartment,
  getDepartmentName,
  canEditMember,
  canDeleteMember,
  openEditDialogForMember,
  openDeleteDialogForMember
}) => {
  const mapMember = (member: any): TeamMember => {
    return {
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      avatar: member.avatar,
      accessLevel: member.accessLevel,
      status: member.status === 'active' ? 'active' : 'inactive' as 'active' | 'inactive',
      joinedDate: member.joinedDate,
      email: member.email || ''
    };
  };

  return (
    <ScrollArea className="h-[550px] w-full rounded-md border">
      <div className="divide-y">
        {teamByDepartment.map((departmentData: any) => (
          <div key={departmentData.departamento_id} className="p-4">
            <h2 className="text-lg font-semibold mb-2">{getDepartmentName(departmentData.departamento_id)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {departmentData.members.map((member: any) => {
                const mappedMember = mapMember(member);

                return (
                  <Card key={member.id}>
                    <CardContent className="flex flex-col items-center text-center p-4">
                      <Avatar className="h-16 w-16 mb-2">
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} alt={member.name} />
                        ) : (
                          <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <h3 className="font-semibold text-md">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <Badge className="mt-2">{mappedMember.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
                      <div className="flex justify-center mt-3 gap-2">
                        {canEditMember(mappedMember) && (
                          <button
                            onClick={() => openEditDialogForMember(mappedMember)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Editar
                          </button>
                        )}
                        {canDeleteMember(mappedMember) && (
                          <button
                            onClick={() => openDeleteDialogForMember(member.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-700"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
