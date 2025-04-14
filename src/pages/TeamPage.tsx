
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { TeamMember } from '@/types';
import { useTeamMembers, MemberFormData, EditMemberFormData } from '@/hooks/useTeamMembers';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { AddMemberDialog } from '@/components/team/AddMemberDialog';
import { EditMemberDialog } from '@/components/team/EditMemberDialog';
import { DeleteMemberDialog } from '@/components/team/DeleteMemberDialog';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TeamPage = () => {
  const {
    teamMembers,
    departamentos,
    loading,
    userAccess,
    addMember,
    updateMember,
    deleteMember,
    getDepartmentName,
    canEditMember
  } = useTeamMembers();

  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  const [novoMembro, setNovoMembro] = useState<MemberFormData>({
    nome: '',
    cargo: '',
    departamento: '',
    avatar_url: ''
  });
  
  const [editMembro, setEditMembro] = useState<EditMemberFormData>({
    id: '',
    nome: '',
    cargo: '',
    departamento: '',
    avatar_url: ''
  });

  const handleAddMember = async () => {
    const success = await addMember(novoMembro);
    if (success) {
      // Limpar os campos e fechar o diálogo
      setNovoMembro({
        nome: '',
        cargo: '',
        departamento: '',
        avatar_url: ''
      });
      setOpenDialog(false);
    }
  };

  const handleEditMember = async () => {
    const success = await updateMember(editMembro);
    if (success) {
      // Limpar os campos e fechar o diálogo
      setEditMembro({
        id: '',
        nome: '',
        cargo: '',
        departamento: '',
        avatar_url: ''
      });
      setOpenEditDialog(false);
    }
  };

  const handleDeleteMember = async () => {
    const success = await deleteMember(selectedMemberId);
    if (success) {
      // Fechar o diálogo
      setOpenDeleteDialog(false);
    }
  };

  const openEditDialogForMember = (member: TeamMember) => {
    setEditMembro({
      id: member.id,
      nome: member.name,
      cargo: member.role,
      departamento: member.department,
      avatar_url: member.avatar,
      nivel_acesso: member.accessLevel as 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user'
    });
    setOpenEditDialog(true);
  };

  const openDeleteDialogForMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setOpenDeleteDialog(true);
  };

  // Verificar se o usuário pode adicionar novos membros (Admin/SuperAdmin)
  const canAddMembers = userAccess === 'SuperAdmin' || userAccess === 'Admin';

  // Verificar se o usuário pode remover membros (Admin/SuperAdmin)
  const canDeleteMember = (memberId: string) => {
    return userAccess === 'SuperAdmin' || userAccess === 'Admin';
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Membros da Equipe</h1>
            <p className="text-muted-foreground">Gerencie os membros da sua equipe e suas funções.</p>
          </div>
          {canAddMembers && (
            <AddMemberDialog
              open={openDialog}
              onOpenChange={setOpenDialog}
              onAddMember={handleAddMember}
              novoMembro={novoMembro}
              setNovoMembro={setNovoMembro}
              departamentos={departamentos}
            />
          )}
        </div>
        
        {userAccess === 'user' && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso Limitado</AlertTitle>
            <AlertDescription>
              Como usuário regular, você só tem acesso para visualizar seu próprio perfil. 
              Para visualizar outros membros da equipe, você precisa de um nível de acesso mais alto.
            </AlertDescription>
          </Alert>
        )}
        
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
      </div>

      {/* Edit Member Dialog */}
      <EditMemberDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        onEditMember={handleEditMember}
        editMembro={editMembro}
        setEditMembro={setEditMembro}
        departamentos={departamentos}
        userAccess={userAccess || 'user'}
      />

      {/* Delete Member Confirmation Dialog */}
      <DeleteMemberDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onDeleteMember={handleDeleteMember}
      />
    </Layout>
  );
};

export default TeamPage;
