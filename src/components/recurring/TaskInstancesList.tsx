
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User } from 'lucide-react';
import { TaskInstance } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { teamMembers } from '@/data/mock-data';

interface TaskInstancesListProps {
  taskInstances: TaskInstance[];
  isLoading: boolean;
}

export const TaskInstancesList: React.FC<TaskInstancesListProps> = ({ 
  taskInstances, 
  isLoading 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  const getAssigneeName = (assigneeId: string) => {
    const member = teamMembers.find(member => member.id === assigneeId);
    return member ? member.name : 'Não atribuído';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Instâncias de Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Carregando instâncias de tarefas...</p>
        ) : taskInstances.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma instância de tarefa encontrada. 
          </p>
        ) : (
          <div className="space-y-4">
            {taskInstances.slice(0, 10).map((task) => (
              <div key={task.id} className="border rounded-md p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority === 'low' ? 'Baixa' : 
                       task.priority === 'medium' ? 'Média' : 'Alta'}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status === 'todo' ? 'A fazer' : 
                       task.status === 'in-progress' ? 'Em progresso' : 
                       task.status === 'review' ? 'Em revisão' : 'Concluída'}
                    </Badge>
                  </div>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{getAssigneeName(task.assigneeId)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    <span>Prazo: {formatDate(task.dueDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
