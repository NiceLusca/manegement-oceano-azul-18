
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tasks, getTeamMemberById, projects } from '@/data/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  color: string;
}

const KanbanColumn = ({ title, tasks, color }: KanbanColumnProps) => {
  return (
    <Card className="flex-1 min-w-[250px]">
      <CardHeader className={`pb-2 ${color}`}>
        <CardTitle className="text-sm font-semibold">{title} ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-2 overflow-y-auto max-h-[calc(100vh-250px)]">
        <div className="space-y-2">
          {tasks.map((task) => {
            const assignee = getTeamMemberById(task.assigneeId);
            const project = projects.find(p => p.id === task.projectId);
            
            return (
              <Card key={task.id} className="hover-scale shadow-sm">
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm mb-1">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <Badge variant="outline" className="text-xs font-normal">
                      {project?.name || "Sem projeto"}
                    </Badge>
                    <Badge 
                      variant={
                        task.priority === 'low' ? 'outline' :
                        task.priority === 'medium' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {task.priority === 'low' ? 'Baixa' : 
                       task.priority === 'medium' ? 'Média' : 'Alta'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                    {assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback>{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export function KanbanBoard() {
  // Group tasks by status
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const reviewTasks = tasks.filter(task => task.status === 'review');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Quadro Kanban</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        <KanbanColumn 
          title="A Fazer" 
          tasks={todoTasks} 
          color="bg-gray-100 dark:bg-gray-800" 
        />
        <KanbanColumn 
          title="Em Progresso" 
          tasks={inProgressTasks} 
          color="bg-blue-100 dark:bg-blue-900/30" 
        />
        <KanbanColumn 
          title="Em Revisão" 
          tasks={reviewTasks} 
          color="bg-yellow-100 dark:bg-yellow-900/30" 
        />
        <KanbanColumn 
          title="Concluído" 
          tasks={completedTasks} 
          color="bg-green-100 dark:bg-green-900/30" 
        />
      </div>
    </div>
  );
}
