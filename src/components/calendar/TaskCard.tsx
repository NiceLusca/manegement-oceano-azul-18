
import React, { useState } from 'react';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTeamMemberById } from '@/data/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TaskDetailsDialog } from '@/components/tasks/TaskDetailsDialog';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      default: return priority;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'A Fazer';
      case 'in-progress': return 'Em Progresso';
      case 'review': return 'Em Revisão';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const assignee = getTeamMemberById(task.assigneeId);
  
  return (
    <>
      <Card 
        className="hover:shadow-md transition-all cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{task.title}</h3>
            <div className="flex gap-2">
              <Badge className={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {task.description}
          </p>
          
          {assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback>
                  {assignee.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignee.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskDetailsDialog
        task={task}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
};
