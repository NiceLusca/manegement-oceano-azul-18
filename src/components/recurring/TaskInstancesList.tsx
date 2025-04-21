
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updateTaskInstanceStatus } from '@/services/tasks/basicTaskService';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { TaskInstance } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface TaskInstancesListProps {
  taskInstances: TaskInstance[];
  isLoading: boolean;
  onStatusChange: () => void;
}

export const TaskInstancesList: React.FC<TaskInstancesListProps> = ({ 
  taskInstances, 
  isLoading,
  onStatusChange
}) => {
  const { toast } = useToast();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
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
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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
  
  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTaskInstanceStatus(taskId, 'completed');
      toast({
        title: 'Tarefa concluída',
        description: 'Status da tarefa atualizado com sucesso!',
      });
      onStatusChange();
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível concluir a tarefa',
        variant: 'destructive',
      });
    }
  };
  
  const handleChangeStatus = async (taskId: string, newStatus: TaskInstance['status']) => {
    try {
      await updateTaskInstanceStatus(taskId, newStatus);
      toast({
        title: 'Status atualizado',
        description: `Tarefa movida para "${getStatusLabel(newStatus)}"`,
      });
      onStatusChange();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status da tarefa',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5" /> Instâncias de Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto">
        {isLoading ? (
          <p>Carregando instâncias de tarefas...</p>
        ) : taskInstances.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma instância de tarefa encontrada.
          </p>
        ) : (
          <div className="space-y-4">
            {taskInstances.map((instance) => (
              <div key={`instance-${instance.id}`} className="border rounded-md p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{instance.title}</h3>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(instance.priority)}>
                      {getPriorityLabel(instance.priority)}
                    </Badge>
                    <Badge className={getStatusColor(instance.status)}>
                      {getStatusLabel(instance.status)}
                    </Badge>
                  </div>
                </div>
                
                {instance.description && (
                  <p className="text-sm text-muted-foreground mb-3">{instance.description}</p>
                )}
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Vence em: {format(new Date(instance.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                </div>
                
                {instance.status !== 'completed' ? (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleCompleteTask(instance.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Concluir
                    </Button>
                    
                    {instance.status === 'todo' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleChangeStatus(instance.id, 'in-progress')}
                      >
                        <Clock className="h-3 w-3 mr-1" /> Iniciar
                      </Button>
                    )}
                    
                    {instance.status === 'in-progress' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleChangeStatus(instance.id, 'review')}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" /> Enviar para revisão
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleChangeStatus(instance.id, 'in-progress')}
                    >
                      <RefreshCcw className="h-3 w-3 mr-1" /> Reabrir
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
