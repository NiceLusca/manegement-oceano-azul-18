
import React from 'react';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { Project } from '@/types';
import { getTasksByProject } from '@/data/mock-data';

type ProjectItemProps = {
  project: Project;
};

export function ProjectItem({ project }: ProjectItemProps) {
  const now = new Date();
  const deadline = new Date(project.deadline);
  const timeRemaining = formatDistance(deadline, now, { addSuffix: false, locale: ptBR });
  const tasks = getTasksByProject(project.id);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{project.name}</h3>
        <ProjectStatusBadge status={project.status} />
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
        <span className={deadline < now ? "text-red-600 dark:text-red-400 font-medium" : ""}>
          {deadline < now ? "Atrasado há " : "Prazo em "}
          {timeRemaining}
        </span>
      </div>
      <Progress value={project.progress} className="h-2" />
    </div>
  );
}
