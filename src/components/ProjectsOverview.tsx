
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { ProjectSearch } from './projects/ProjectSearch';
import { ProjectSort } from './projects/ProjectSort';
import { ProjectItem } from './projects/ProjectItem';
import { ProjectFormDialog } from './projects/ProjectFormDialog';

export function ProjectsOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'deadline' | 'progress'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [nivelAcesso] = useState("admin");
  const [openDialog, setOpenDialog] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    status: 'todo',
    prioridade: 'medium',
    responsavel: '',
    departamento: '',
    dataVencimento: '',
    dataHora: '',
    isRecurring: false,
    recurrenceType: 'daily',
    endDate: '',
    customDays: [],
  });
  
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
    if (!novaTarefa.titulo.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Nova tarefa adicionada com sucesso!",
      variant: "default"
    });

    setNovaTarefa({
      titulo: '',
      descricao: '',
      status: 'todo',
      prioridade: 'medium',
      responsavel: '',
      departamento: '',
      dataVencimento: '',
      dataHora: '',
      isRecurring: false,
      recurrenceType: 'daily',
      endDate: '',
      customDays: [],
    });
    setOpenDialog(false);
  };

  // Filter and sort projects
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
          <ProjectFormDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            teamMembers={[]}
            departamentos={[]}
            membrosFiltrados={[]}
            onDepartmentChange={() => {}}
            onSubmit={handleAddTask}
            novaTarefa={novaTarefa}
            setNovaTarefa={setNovaTarefa}
          />
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
