
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectSearch } from './projects/ProjectSearch';
import { ProjectSort } from './projects/ProjectSort';
import { ProjectItem } from './projects/ProjectItem';

export function ProjectsOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'deadline' | 'progress'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [nivelAcesso] = useState("admin");
  const [openDialog, setOpenDialog] = useState(false);
  const [novaTarefaNome, setNovaTarefaNome] = useState('');
  const [novaTarefaDescricao, setNovaTarefaDescricao] = useState('');
  const [novaTarefaStatus, setNovaTarefaStatus] = useState('planning');
  const { toast } = useToast();
  
  const isAdmin = nivelAcesso === "admin";

  const handleSort = (field: 'name' | 'deadline' | 'progress') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleAddTask = () => {
    if (!novaTarefaNome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da tarefa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Nova tarefa adicionada com sucesso!",
      variant: "default"
    });

    setNovaTarefaNome('');
    setNovaTarefaDescricao('');
    setNovaTarefaStatus('planning');
    setOpenDialog(false);
  };

  // Filtra e ordena os projetos
  const filteredProjects = projects
    .filter(project => 
      (statusFilter ? project.status === statusFilter : true) &&
      (searchTerm ? 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) 
        : true
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        case 'deadline':
          return sortDirection === 'asc' 
            ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            : new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        case 'progress':
          return sortDirection === 'asc'
            ? a.progress - b.progress
            : b.progress - a.progress;
        default:
          return 0;
      }
    });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visão Geral das Tarefas</CardTitle>
        {isAdmin && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
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
                  <Label htmlFor="nome" className="text-right">Nome</Label>
                  <Input
                    id="nome"
                    value={novaTarefaNome}
                    onChange={(e) => setNovaTarefaNome(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descricao" className="text-right">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={novaTarefaDescricao}
                    onChange={(e) => setNovaTarefaDescricao(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select
                    value={novaTarefaStatus}
                    onValueChange={setNovaTarefaStatus}
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
                <Button type="button" onClick={handleAddTask}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <ProjectSearch
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={(value) => setStatusFilter(value === "all" ? null : value)}
          />
          <ProjectSort
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
        
        <div className="space-y-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <ProjectItem project={project} />
                {isAdmin && (
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar tarefa</DropdownMenuItem>
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Atribuir equipe</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Arquivar tarefa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Nenhuma tarefa encontrada com os filtros aplicados.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
