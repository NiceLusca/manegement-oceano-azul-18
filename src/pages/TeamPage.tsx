
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { TeamMember } from '@/types';
import { useTeamMembers, MemberFormData, EditMemberFormData } from '@/hooks/useTeamMembers';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { AddMemberDialog } from '@/components/team/AddMemberDialog';
import { EditMemberDialog } from '@/components/team/EditMemberDialog';
import { DeleteMemberDialog } from '@/components/team/DeleteMemberDialog';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { DepartmentTeamView } from '@/components/team/DepartmentTeamView';
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

  // Fetch team by department view
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Membros da Equipe</h1>
            <p className="text-muted-foreground">Gerencie os membros da sua equipe e suas funções.</p>
          </div>
          {canAddMembers() && (
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
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

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
