
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, RefreshCw, User, Clock, Calendar } from 'lucide-react';
import { RecurringTask } from '@/types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { deleteRecurringTask } from '@/services/tasks';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RecurringTasksListProps {
  recurringTasks: RecurringTask[];
  isLoading: boolean;
}

export const RecurringTasksList: React.FC<RecurringTasksListProps> = ({ 
  recurringTasks, 
  isLoading 
}) => {
  const { toast } = useToast();
  
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
    // This is a temporary fix - ideally we would fetch the assignee name from profiles
    return assigneeId || 'Não atribuído';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };
  
  const handleDelete = async (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa recorrente? Todas as instâncias serão excluídas também.')) {
      try {
        await deleteRecurringTask(taskId);
        toast({
          title: 'Tarefa excluída',
          description: 'A tarefa recorrente foi excluída com sucesso',
        });
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a tarefa recorrente',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" /> Tarefas Recorrentes
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto">
        {isLoading ? (
          <p>Carregando tarefas recorrentes...</p>
        ) : recurringTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma tarefa recorrente encontrada. Crie uma tarefa clicando no botão acima.
          </p>
        ) : (
          <div className="space-y-4">
            {recurringTasks.map((task) => (
              <div key={`recurring-${task.id}`} className="border rounded-md p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <div className="flex gap-2">
                    <Badge>
                      {getRecurrenceLabel(task.recurrenceType)}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDelete(task.id)}
                          >
                            <span className="sr-only">Excluir</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir tarefa recorrente</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                    <span>Início: {formatDate(task.startDate)}</span>
                  </div>
                  {task.endDate && (
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      <span>Término: {formatDate(task.endDate)}</span>
                    </div>
                  )}
                  {task.lastGenerated && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Última geração: {formatDate(task.lastGenerated)}</span>
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
