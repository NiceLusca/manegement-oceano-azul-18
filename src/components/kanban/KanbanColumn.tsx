
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import { useDragAndDrop } from '../dragAndDrop/useDragAndDrop';
import { KanbanTask } from './KanbanTask';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  color: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, tasks, color }) => {
  const { handleDragOver, handleDrop, handleDragStart } = useDragAndDrop();
  const statusMap = {
    "A Fazer": "todo",
    "Em Progresso": "in-progress",
    "Em Revisão": "review",
    "Concluído": "completed"
  } as const;
  
  const status = statusMap[title as keyof typeof statusMap];
  
  return (
    <Card 
      className="flex-1 min-w-[250px] shadow-md"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, status)}
    >
      <CardHeader className={`pb-2 ${color}`}>
        <CardTitle className="text-sm font-semibold">{title} ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-2 overflow-y-auto max-h-[calc(100vh-250px)]">
        <div className="space-y-2">
          {tasks.map((task) => (
            <KanbanTask 
              key={task.isRecurring ? `instance-${task.id}` : `task-${task.id}`} 
              task={task} 
              onDragStart={handleDragStart} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
