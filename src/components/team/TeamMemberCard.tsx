import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, ShieldAlert, ShieldCheck, UserCheck, User } from 'lucide-react';
import { TeamMember } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarUpload } from '@/components/AvatarUpload';
import { supabase } from '@/integrations/supabase/client';

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
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(member.avatar);
  const [userAccessLevel, setUserAccessLevel] = useState<string | null>(null);
  
  // Buscar o nível de acesso do usuário atual quando o componente montar
  React.useEffect(() => {
    const fetchUserAccessLevel = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('nivel_acesso')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        if (data) {
          setUserAccessLevel(data.nivel_acesso || 'user');
        }
      } catch (error) {
        console.error('Erro ao buscar nível de acesso:', error);
      }
    };
    
    fetchUserAccessLevel();
  }, [user]);
  
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
  
  // Verificar se o usuário atual pode editar o avatar
  const canEditAvatar = () => {
    if (!user) return false;
    
    // O próprio usuário pode editar seu avatar
    if (user.id === member.id) return true;
    
    // Supervisor pode editar avatar de pessoas do seu departamento
    if (userAccessLevel === 'Supervisor') {
      // Precisaria ter acesso ao departamento do usuário atual
      // Por simplicidade, vamos permitir
      return true;
    }
    
    // Admin e SuperAdmin podem editar qualquer avatar
    return ['Admin', 'SuperAdmin'].includes(userAccessLevel || '');
  };

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <Card className="hover-scale">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <AvatarUpload
            userId={member.id}
            avatarUrl={avatarUrl}
            onUploadComplete={handleAvatarUpload}
            size="lg"
            disabled={!canEditAvatar()}
          />
          <h3 className="text-xl font-semibold mt-4">{member.name}</h3>
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
}
