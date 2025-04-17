import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { TeamMember } from '@/types';
import { useTeamMembers, MemberFormData, EditMemberFormData } from '@/hooks/useTeamMembers';
import { EditMemberDialog } from '@/components/team/EditMemberDialog';
import { DeleteMemberDialog } from '@/components/team/DeleteMemberDialog';
import { TeamPageHeader } from '@/components/team/TeamPageHeader';
import { TeamTabs } from '@/components/team/TeamTabs';
import { supabase } from '@/integrations/supabase/client';

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
    canEditMember,
    canAddMembers,
    canDeleteMember,
    error
  } = useTeamMembers();

  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'departments'>('all');
  const [teamByDepartment, setTeamByDepartment] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  
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

  useEffect(() => {
    const fetchDepartmentView = async () => {
      try {
        setLoadingDepartments(true);
        const { data, error } = await supabase
          .from('team_by_department')
          .select('*');
        
        if (error) throw error;
        
        setTeamByDepartment(data || []);
      } catch (error) {
        console.error('Error fetching department view:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };
    
    fetchDepartmentView();
  }, [teamMembers]);

  const handleAddMember = async () => {
    const success = await addMember(novoMembro);
    if (success) {
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

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <TeamPageHeader
          userAccess={userAccess}
          error={error}
          canAddMembers={canAddMembers()}
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          novoMembro={novoMembro}
          setNovoMembro={setNovoMembro}
          departamentos={departamentos}
        />

        <TeamTabs
          viewMode={viewMode}
          setViewMode={setViewMode}
          loading={loading}
          loadingDepartments={loadingDepartments}
          teamMembers={teamMembers}
          teamByDepartment={teamByDepartment}
          getDepartmentName={getDepartmentName}
          canEditMember={canEditMember}
          canDeleteMember={canDeleteMember}
          openEditDialogForMember={openEditDialogForMember}
          openDeleteDialogForMember={openDeleteDialogForMember}
        />
      </div>

      <EditMemberDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        onEditMember={handleEditMember}
        editMembro={editMembro}
        setEditMembro={setEditMembro}
        departamentos={departamentos}
        userAccess={userAccess || 'user'}
      />

      <DeleteMemberDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onDeleteMember={handleDeleteMember}
      />
    </Layout>
  );
};

export default TeamPage;
