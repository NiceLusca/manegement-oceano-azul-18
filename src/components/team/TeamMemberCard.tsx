
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, ShieldAlert, ShieldCheck, UserCheck, User } from 'lucide-react';
import { TeamMember } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMemberCardProps {
  member: TeamMember;
  departmentName: string;
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  departmentName,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}) => {
  // Função para renderizar o ícone baseado no nível de acesso
  const renderAccessLevelIcon = (accessLevel: string | undefined) => {
    switch(accessLevel) {
      case 'SuperAdmin':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'Admin':
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case 'Supervisor':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para obter a cor do badge baseado no nível de acesso
  const getAccessLevelBadgeVariant = (accessLevel: string | undefined) => {
    switch(accessLevel) {
      case 'SuperAdmin':
        return 'destructive';
      case 'Admin':
        return 'default';
      case 'Supervisor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Função para obter o texto do nível de acesso
  const getAccessLevelText = (accessLevel: string | undefined) => {
    switch(accessLevel) {
      case 'SuperAdmin':
        return 'Super Admin';
      case 'Admin':
        return 'Admin';
      case 'Supervisor':
        return 'Supervisor';
      default:
        return 'Usuário';
    }
  };

  return (
    <Card className="hover-scale">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold">{member.name}</h3>
          <p className="text-muted-foreground">{member.role}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
              {member.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge variant="outline">{departmentName}</Badge>
          </div>
          
          <div className="mt-2 flex items-center gap-1">
            <Badge variant={getAccessLevelBadgeVariant(member.accessLevel)} className="flex items-center gap-1">
              {renderAccessLevelIcon(member.accessLevel)}
              {getAccessLevelText(member.accessLevel)}
            </Badge>
          </div>
          
          <div className="w-full mt-4 border-t pt-4">
            <div className="flex justify-between gap-2 mt-4">
              {canEdit ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(member)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              
              {canDelete ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground" 
                  onClick={() => onDelete(member.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-muted-foreground" 
                  disabled
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
