
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects, getTasksByProject } from '@/data/mock-data';
import { Progress } from '@/components/ui/progress';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Plus, Search, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProjectsOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'deadline' | 'progress'>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [nivelAcesso] = useState("admin"); // Em uma aplicação real, viria de um contexto de autenticação
  
  const isAdmin = nivelAcesso === "admin";
  
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
  
  const handleSort = (field: 'name' | 'deadline' | 'progress') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visão Geral dos Projetos</CardTitle>
        {isAdmin && (
          <Button variant="outline" size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" /> Novo Projeto
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value === "" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="planning">Planejamento</SelectItem>
              <SelectItem value="in-progress">Em Progresso</SelectItem>
              <SelectItem value="review">Em Revisão</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Ordenar por
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort('name')}>
                Nome {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('deadline')}>
                Prazo {sortBy === 'deadline' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('progress')}>
                Progresso {sortBy === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const now = new Date();
              const deadline = new Date(project.deadline);
              const timeRemaining = formatDistance(deadline, now, { addSuffix: false, locale: ptBR });
              const tasks = getTasksByProject(project.id);
              const completedTasks = tasks.filter(task => task.status === 'completed').length;
              
              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{project.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        project.status === 'planning' ? 'bg-gray-100 text-gray-800' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.status === 'planning' ? 'Planejamento' :
                         project.status === 'in-progress' ? 'Em Progresso' :
                         project.status === 'review' ? 'Em Revisão' : 
                         'Concluído'}
                      </span>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar projeto</DropdownMenuItem>
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Atribuir equipe</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Arquivar projeto</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Progresso:</span> {project.progress}%
                      </span>
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Tarefas:</span> {completedTasks}/{tasks.length}
                      </span>
                    </div>
                    <span className={deadline < now ? "text-red-600 font-medium" : ""}>
                      {deadline < now ? "Atrasado há " : "Prazo em "}
                      {timeRemaining}
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum projeto encontrado com os filtros aplicados.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
