
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, Users } from 'lucide-react';
import { TeamMember } from '@/types';

interface DepartmentTeamViewProps {
  departmentsData: any[];
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
  canEditMember: (memberId: string) => boolean;
  canDeleteMember: (memberId: string) => boolean;
}

export const DepartmentTeamView: React.FC<DepartmentTeamViewProps> = ({
  departmentsData,
  onEditMember,
  onDeleteMember,
  canEditMember,
  canDeleteMember
}) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-8">
      {departmentsData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <Users className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum departamento encontrado. Crie um departamento para começar a organizar sua equipe.
            </p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" /> Novo Departamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        departmentsData.map((department) => (
          <Card key={department.department_id} className="overflow-hidden">
            <CardHeader 
              className="pb-2 flex flex-row items-center justify-between"
              style={{ 
                borderBottom: `2px solid ${department.department_color || '#e2e8f0'}`,
                backgroundColor: `${department.department_color}10` // Very light tint of the department color
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: department.department_color || '#94a3b8' }}
                />
                <CardTitle>{department.department_name || 'Sem Departamento'}</CardTitle>
              </div>
              <Badge variant="outline">
                {department.member_count || 0} {department.member_count === 1 ? 'membro' : 'membros'}
              </Badge>
            </CardHeader>
            
            <CardContent className="pt-4">
              {(!department.members || department.members.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-24 text-center p-6">
                  <p className="text-muted-foreground">Nenhum membro neste departamento</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {department.members?.map((member: any) => {
                    // Convert department member to TeamMember format for the handlers
                    const teamMember = {
                      id: member.id,
                      name: member.nome || 'Sem nome',
                      role: member.cargo || 'Colaborador',
                      department: department.department_id,
                      avatar: member.avatar_url,
                      accessLevel: member.nivel_acesso || 'user',
                      status: 'active',
                      joinedDate: member.created_at,
                      email: ''
                    };
                    
                    return (
                      <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-16 w-16 mb-2">
                              {member.avatar_url ? (
                                <AvatarImage src={member.avatar_url} alt={member.nome} />
                              ) : null}
                              <AvatarFallback>
                                {getInitials(member.nome || 'CM')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <h3 className="font-semibold text-sm mt-1 line-clamp-1">{member.nome || 'Sem nome'}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{member.cargo || 'Colaborador'}</p>
                            
                            <div className="flex justify-between gap-1 w-full mt-3">
                              {canEditMember(member.id) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-xs px-2.5"
                                  onClick={() => onEditMember(teamMember)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                              )}
                              
                              {canDeleteMember(member.id) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-xs px-2.5 text-destructive hover:bg-destructive hover:text-destructive-foreground" 
                                  onClick={() => onDeleteMember(member.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Excluir
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* Add Member Card */}
                  <Card key="add-member" className="overflow-hidden hover:shadow-md transition-shadow border-dashed">
                    <CardContent className="p-4 flex items-center justify-center h-full">
                      <Button variant="ghost" className="w-full h-full flex flex-col gap-2 py-8">
                        <Plus className="h-8 w-8" />
                        <span>Adicionar</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
