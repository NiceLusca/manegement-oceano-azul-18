
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects, teamMembers } from '@/data/mock-data';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, CheckSquare } from 'lucide-react';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useToast } from '@/components/ui/use-toast';
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

const ProjectsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [novoProjeto, setNovoProjeto] = useState({
    nome: '',
    descricao: '',
    status: 'planning',
  });
  const { toast } = useToast();

  const handleAddProject = () => {
    // Em uma aplicação real, aqui seria feita a chamada à API para adicionar o projeto
    if (!novoProjeto.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do projeto é obrigatório",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Novo projeto adicionado com sucesso!",
      variant: "default"
    });

    // Limpa os campos e fecha o diálogo
    setNovoProjeto({
      nome: '',
      descricao: '',
      status: 'planning',
    });
    setOpenDialog(false);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projetos</h1>
            <p className="text-muted-foreground">Gerencie os projetos da sua equipe.</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Projeto</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para criar um novo projeto.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    value={novoProjeto.nome}
                    onChange={(e) => setNovoProjeto({...novoProjeto, nome: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descricao" className="text-right">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    value={novoProjeto.descricao}
                    onChange={(e) => setNovoProjeto({...novoProjeto, descricao: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={novoProjeto.status}
                    onValueChange={(value) => setNovoProjeto({...novoProjeto, status: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planejamento</SelectItem>
                      <SelectItem value="in-progress">Em Progresso</SelectItem>
                      <SelectItem value="review">Em Revisão</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddProject}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <KanbanBoard />
        
        <h2 className="text-xl font-bold mt-8">Visão Geral de Projetos</h2>
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
      </div>
    </Layout>
  );
};

export default ProjectsPage;
