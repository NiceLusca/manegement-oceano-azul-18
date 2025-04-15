
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { TeamMember } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepartmentTeamViewProps {
  departmentsData: Array<{
    department_id: string;
    department_name: string;
    department_color: string | null;
    member_count: number;
    members: any[];
  }>;
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
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatMemberForEdit = (member: any): TeamMember => {
    return {
      id: member.id,
      name: member.nome || '',
      role: member.cargo || '',
      email: '',
      avatar: member.avatar_url || '',
      department: member.department_id || '',
      status: 'active',
      joinedDate: new Date().toISOString(),
      accessLevel: member.nivel_acesso || 'user'
    };
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {departmentsData.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Nenhum departamento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        departmentsData.map((dept) => (
          <Card key={dept.department_id} className="overflow-hidden">
            <CardHeader className={cn(
              "pb-3",
              dept.department_color ? `bg-opacity-10 bg-[${dept.department_color}]` : "bg-muted/50"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dept.department_color && (
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: dept.department_color }}
                    />
                  )}
                  <CardTitle>{dept.department_name || 'Sem departamento'}</CardTitle>
                </div>
                <Badge variant="outline">{dept.member_count} membros</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {dept.members && dept.members.length > 0 ? (
                <div className="space-y-3">
                  {dept.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>{getInitials(member.nome)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.nome || 'Sem nome'}</p>
                          <p className="text-sm text-muted-foreground">{member.cargo || 'Colaborador'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={cn({
                            "bg-blue-100 border-blue-200 text-blue-800": member.nivel_acesso === "user",
                            "bg-purple-100 border-purple-200 text-purple-800": member.nivel_acesso === "Supervisor",
                            "bg-amber-100 border-amber-200 text-amber-800": member.nivel_acesso === "Admin",
                            "bg-red-100 border-red-200 text-red-800": member.nivel_acesso === "SuperAdmin",
                          })}
                        >
                          {member.nivel_acesso || 'Usuário'}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-full hover:bg-muted">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditMember(member.id) && (
                              <DropdownMenuItem onClick={() => onEditMember(formatMemberForEdit(member))}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {canDeleteMember(member.id) && (
                              <DropdownMenuItem 
                                onClick={() => onDeleteMember(member.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum membro neste departamento.
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
