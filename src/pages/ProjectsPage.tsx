
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, CheckSquare } from 'lucide-react';
import { KanbanBoard } from '@/components/KanbanBoard';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Project, TeamMember, Task } from '@/types';

const TasksPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    status: 'todo',
    prioridade: 'medium',
    responsavel: '',
    dataVencimento: ''
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const fetchProjects = async () => {
    try {
      // Primeiro tentamos buscar do Supabase
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) throw tasksError;

      // Convertendo as tarefas para o formato esperado pelo componente
      const mockProjects: Project[] = [];
      
      // Se não houver dados, usamos os dados simulados
      if (!tasksData || tasksData.length === 0) {
        // Usar os dados simulados existentes na importação
        // Mock data continuará sendo usado até que tenhamos um modelo completo de projetos no banco
        const { projects } = await import('@/data/mock-data');
        setProjects(projects);
      } else {
        // Criar um "projeto" simulado com as tarefas reais
        const realTasks = tasksData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status as 'todo' | 'in-progress' | 'review' | 'completed',
          assigneeId: task.assignee_id || '',
          dueDate: task.due_date || new Date().toISOString(),
          priority: task.priority as 'low' | 'medium' | 'high',
          projectId: 'default-project'
        }));

        const defaultProject: Project = {
          id: 'default-project',
          name: 'Tarefas do Sistema',
          description: 'Todas as tarefas registradas no sistema',
          status: 'in-progress',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          teamMembers: tasksData
            .filter(task => task.assignee_id)
            .map(task => task.assignee_id as string),
          tasks: realTasks
        };

        mockProjects.push(defaultProject);
        setProjects(mockProjects);
      }
    } catch (error: any) {
      console.error('Erro ao buscar tarefas:', error.message);
      // Se falhar, podemos usar os dados simulados como fallback
      const { projects } = await import('@/data/mock-data');
      setProjects(projects);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
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
      // Se falhar, podemos usar os dados simulados como fallback
      const { teamMembers } = await import('@/data/mock-data');
      setTeamMembers(teamMembers);
    }
  };

  const handleAddTask = async () => {
    // Validações básicas
    if (!novaTarefa.titulo.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      // Inserir a nova tarefa no Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: novaTarefa.titulo,
            description: novaTarefa.descricao,
            status: novaTarefa.status,
            priority: novaTarefa.prioridade,
            assignee_id: novaTarefa.responsavel || null,
            due_date: novaTarefa.dataVencimento ? new Date(novaTarefa.dataVencimento).toISOString() : null
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nova tarefa adicionada com sucesso!",
        variant: "default"
      });

      // Recarregar as tarefas após a adição
      fetchProjects();

      // Limpar os campos e fechar o diálogo
      setNovaTarefa({
        titulo: '',
        descricao: '',
        status: 'todo',
        prioridade: 'medium',
        responsavel: '',
        dataVencimento: ''
      });
      setOpenDialog(false);
    } catch (error: any) {
      console.error('Erro ao adicionar tarefa:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa: " + error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tarefas</h1>
            <p className="text-muted-foreground">Gerencie as tarefas da sua equipe.</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para criar uma nova tarefa.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="titulo" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="titulo"
                    value={novaTarefa.titulo}
                    onChange={(e) => setNovaTarefa({...novaTarefa, titulo: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descricao" className="text-right">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    value={novaTarefa.descricao}
                    onChange={(e) => setNovaTarefa({...novaTarefa, descricao: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={novaTarefa.status}
                    onValueChange={(value) => setNovaTarefa({...novaTarefa, status: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">A Fazer</SelectItem>
                      <SelectItem value="in-progress">Em Progresso</SelectItem>
                      <SelectItem value="review">Em Revisão</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prioridade" className="text-right">
                    Prioridade
                  </Label>
                  <Select
                    value={novaTarefa.prioridade}
                    onValueChange={(value) => setNovaTarefa({...novaTarefa, prioridade: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="responsavel" className="text-right">
                    Responsável
                  </Label>
                  <Select
                    value={novaTarefa.responsavel}
                    onValueChange={(value) => setNovaTarefa({...novaTarefa, responsavel: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dataVencimento" className="text-right">
                    Data de Vencimento
                  </Label>
                  <Input
                    id="dataVencimento"
                    type="date"
                    value={novaTarefa.dataVencimento}
                    onChange={(e) => setNovaTarefa({...novaTarefa, dataVencimento: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddTask}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <KanbanBoard />
        
        <h2 className="text-xl font-bold mt-8">Visão Geral de Tarefas</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando tarefas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => {
              const projectMembers = project.teamMembers.map(memberId => 
                teamMembers.find(member => member.id === memberId)
              ).filter(Boolean);
              
              return (
                <Card key={project.id} className="hover-scale">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{project.name}</CardTitle>
                      <Badge 
                        variant={
                          project.status === 'planning' ? 'outline' :
                          project.status === 'in-progress' ? 'default' :
                          project.status === 'review' ? 'secondary' :
                          'default'
                        }
                      >
                        {project.status === 'planning' ? 'Planejamento' :
                         project.status === 'in-progress' ? 'Em Progresso' :
                         project.status === 'review' ? 'Em Revisão' :
                         'Concluído'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Progresso</span>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2 mb-6" />
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CheckSquare className="h-4 w-4" />
                        <span>{project.tasks.length} tarefas</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{project.teamMembers.length} membros</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex -space-x-2">
                        {projectMembers.slice(0, 3).map((member, index) => (
                          <Avatar key={index} className="border-2 border-background h-8 w-8">
                            <AvatarImage src={member?.avatar} />
                            <AvatarFallback>{member?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        ))}
                        {projectMembers.length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground text-xs border-2 border-background">
                            +{projectMembers.length - 3}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TasksPage;
