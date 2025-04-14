
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckSquare, Users } from 'lucide-react';
import { Project, TeamMember } from '@/types';

interface ProjectsListProps {
  projects: Project[];
  teamMembers: TeamMember[];
  loading: boolean;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ projects, teamMembers, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {projects.map((project) => {
        const projectMembers = project.teamMembers
          .map(memberId => teamMembers.find(member => member.id === memberId))
          .filter(Boolean) as TeamMember[];

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
  );
};
