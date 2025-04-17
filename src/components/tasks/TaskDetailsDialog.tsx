
import React from 'react';
import { Task } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, History } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskHistory } from './TaskHistory';

interface TaskDetailsDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailsDialog({ task, open, onOpenChange }: TaskDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-semibold">{task.title}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Prazo: {format(new Date(task.dueDate), "dd 'de' MMMM", { locale: ptBR })}
                </span>
                <Clock className="h-4 w-4 ml-2" />
                <span>
                  {format(new Date(task.dueDate), "HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status === 'todo' ? 'A Fazer' :
                 task.status === 'in-progress' ? 'Em Progresso' :
                 task.status === 'review' ? 'Em Revisão' :
                 'Concluído'}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority === 'low' ? 'Baixa' :
                 task.priority === 'medium' ? 'Média' :
                 'Alta'} Prioridade
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || "Sem descrição"}
              </p>
            </div>
            
            {task.assigneeId && (
              <div>
                <h3 className="font-medium mb-2">Responsável</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${task.assigneeId}&background=0D8ABC&color=fff`} />
                    <AvatarFallback>
                      {task.assigneeId.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assigneeId}</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-4">
                <History className="h-4 w-4" />
                <h3 className="font-medium">Histórico de Atividades</h3>
              </div>
              <TaskHistory taskId={task.id} />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
