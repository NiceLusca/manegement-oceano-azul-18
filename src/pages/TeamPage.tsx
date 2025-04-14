
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { teamMembers, getTasksByAssignee } from '@/data/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Phone, Edit, Trash2, Check, X, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departamentos, setDepartamentos] = useState<{id: string, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const { toast } = useToast();
  
  const [novoMembro, setNovoMembro] = useState({
    nome: '',
    cargo: '',
    departamento: '',
    avatar_url: ''
  });
  
  const [editMembro, setEditMembro] = useState({
    id: '',
    nome: '',
    cargo: '',
    departamento: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetchTeamMembers();
    fetchDepartamentos();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      
      // Mapear os dados do Supabase para o formato da interface TeamMember
      const formattedMembers: TeamMember[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.nome || 'Sem nome',
        role: profile.cargo || 'Colaborador',
        email: '',  // O Supabase não armazena emails no perfil
        avatar: profile.avatar_url || '',
        department: profile.departamento_id || '',
        status: 'active' as 'active' | 'inactive', // Definindo como 'active' para corresponder ao tipo esperado
        joinedDate: profile.created_at
      }));
      
      setTeamMembers(formattedMembers);
    } catch (error: any) {
      console.error('Erro ao buscar equipe:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a equipe: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('departamentos')
        .select('*');

      if (error) throw error;
      
      setDepartamentos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar departamentos:', error.message);
    }
  };

  const handleAddMember = async () => {
    if (!novoMembro.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do membro é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            nome: novoMembro.nome,
            cargo: novoMembro.cargo,
            departamento_id: novoMembro.departamento,
            avatar_url: novoMembro.avatar_url
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Novo membro adicionado com sucesso!",
        variant: "default"
      });

      // Recarregar a lista de membros
      fetchTeamMembers();

      // Limpar os campos e fechar o diálogo
      setNovoMembro({
        nome: '',
        cargo: '',
        departamento: '',
        avatar_url: ''
      });
      setOpenDialog(false);
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditMember = async () => {
    if (!editMembro.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do membro é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: editMembro.nome,
          cargo: editMembro.cargo,
          departamento_id: editMembro.departamento,
          avatar_url: editMembro.avatar_url
        })
        .eq('id', editMembro.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso!",
        variant: "default"
      });

      // Recarregar a lista de membros
      fetchTeamMembers();

      // Limpar os campos e fechar o diálogo
      setEditMembro({
        id: '',
        nome: '',
        cargo: '',
        departamento: '',
        avatar_url: ''
      });
      setOpenEditDialog(false);
    } catch (error: any) {
      console.error('Erro ao atualizar membro:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteMember = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedMemberId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso!",
        variant: "default"
      });

      // Recarregar a lista de membros
      fetchTeamMembers();

      // Fechar o diálogo
      setOpenDeleteDialog(false);
    } catch (error: any) {
      console.error('Erro ao excluir membro:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o membro: " + error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialogForMember = (member: TeamMember) => {
    // Encontrar o departamento correspondente
    const department = departamentos.find(d => d.id === member.department);
    
    setEditMembro({
      id: member.id,
      nome: member.name,
      cargo: member.role,
      departamento: member.department,
      avatar_url: member.avatar
    });
    setOpenEditDialog(true);
  };

  const openDeleteDialogForMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setOpenDeleteDialog(true);
  };

  const getDepartamentoNome = (departamentoId: string) => {
    const departamento = departamentos.find(d => d.id === departamentoId);
    return departamento ? departamento.nome : 'Sem departamento';
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Membros da Equipe</h1>
            <p className="text-muted-foreground">Gerencie os membros da sua equipe e suas funções.</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Membro</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para adicionar um novo membro à equipe.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    value={novoMembro.nome}
                    onChange={(e) => setNovoMembro({...novoMembro, nome: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cargo" className="text-right">
                    Cargo
                  </Label>
                  <Input
                    id="cargo"
                    value={novoMembro.cargo}
                    onChange={(e) => setNovoMembro({...novoMembro, cargo: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="departamento" className="text-right">
                    Departamento
                  </Label>
                  <Select
                    value={novoMembro.departamento}
                    onValueChange={(value) => setNovoMembro({...novoMembro, departamento: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem key={dep.id} value={dep.id}>
                          {dep.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avatar" className="text-right">
                    URL do Avatar
                  </Label>
                  <Input
                    id="avatar"
                    value={novoMembro.avatar_url}
                    onChange={(e) => setNovoMembro({...novoMembro, avatar_url: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddMember}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando membros da equipe...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => {
              return (
                <Card key={member.id} className="hover-scale">
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
                        <Badge variant="outline">{getDepartamentoNome(member.department)}</Badge>
                      </div>
                      
                      <div className="w-full mt-4 border-t pt-4">
                        <div className="flex justify-between gap-2 mt-4">
                          <Button variant="outline" size="sm" className="w-full" onClick={() => openEditDialogForMember(member)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => openDeleteDialogForMember(member.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
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
            })}
          </div>
        )}
      </div>

      {/* Diálogo de Edição */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do membro selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nome" className="text-right">
                Nome
              </Label>
              <Input
                id="edit-nome"
                value={editMembro.nome}
                onChange={(e) => setEditMembro({...editMembro, nome: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-cargo" className="text-right">
                Cargo
              </Label>
              <Input
                id="edit-cargo"
                value={editMembro.cargo}
                onChange={(e) => setEditMembro({...editMembro, cargo: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-departamento" className="text-right">
                Departamento
              </Label>
              <Select
                value={editMembro.departamento}
                onValueChange={(value) => setEditMembro({...editMembro, departamento: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map((dep) => (
                    <SelectItem key={dep.id} value={dep.id}>
                      {dep.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-avatar" className="text-right">
                URL do Avatar
              </Label>
              <Input
                id="edit-avatar"
                value={editMembro.avatar_url}
                onChange={(e) => setEditMembro({...editMembro, avatar_url: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleEditMember}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este membro da equipe? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default TeamPage;
