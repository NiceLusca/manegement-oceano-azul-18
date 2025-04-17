
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, RefreshCw, User } from 'lucide-react';
import { RecurringTask } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { teamMembers } from '@/data/mock-data';

interface RecurringTasksListProps {
  recurringTasks: RecurringTask[];
  isLoading: boolean;
}

export const RecurringTasksList: React.FC<RecurringTasksListProps> = ({ 
  recurringTasks, 
  isLoading 
}) => {
  const getRecurrenceLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'custom': return 'Personalizada';
      default: return type;
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
          <RefreshCw className="h-5 w-5" /> Tarefas Recorrentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Carregando tarefas recorrentes...</p>
        ) : recurringTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma tarefa recorrente encontrada. Crie uma tarefa clicando no botão acima.
          </p>
        ) : (
          <div className="space-y-4">
            {recurringTasks.map((task) => (
              <div key={task.id} className="border rounded-md p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Badge>
                    {getRecurrenceLabel(task.recurrenceType)}
                  </Badge>
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
                    <span>Início: {formatDate(task.startDate)}</span>
                  </div>
                  {task.endDate && (
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      <span>Término: {formatDate(task.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
