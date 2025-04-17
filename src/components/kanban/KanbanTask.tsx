
import React from 'react';
import { Task } from '@/types';
import { getTeamMemberById, projects } from '@/data/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarClock } from 'lucide-react';

interface KanbanTaskProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

export const KanbanTask: React.FC<KanbanTaskProps> = ({ task, onDragStart }) => {
  const assignee = getTeamMemberById(task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);
  
  return (
    <Card 
      key={task.id} 
      className="hover-scale shadow-sm cursor-move" 
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm mb-1">{task.title}</h3>
          {task.isRecurring && (
            <Badge variant="outline" className="ml-1 bg-[#D0E9FF] text-[#005B99] border-[#D0E9FF]/70 flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex justify-between items-center text-xs">
          <Badge variant="outline" className="text-xs font-normal">
            {project?.name || "Sem categoria"}
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
};
