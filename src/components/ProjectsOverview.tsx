
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects } from '@/data/mock-data';
import { Progress } from '@/components/ui/progress';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ProjectsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral dos Projetos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project) => {
            const now = new Date();
            const deadline = new Date(project.deadline);
            const timeRemaining = formatDistance(deadline, now, { addSuffix: false, locale: ptBR });
            
            return (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{project.name}</h3>
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
                </div>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>{project.progress}% completo</span>
                  <span>Prazo em {timeRemaining}</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
