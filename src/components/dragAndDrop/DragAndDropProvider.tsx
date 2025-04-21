
import React, { useState } from 'react';
import { DragAndDropContext, DragAndDropContextType } from './DragAndDropContext';
import { Task } from '@/types';
import { updateTaskStatus } from '@/services/tasks';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { addActivityEntry } from '@/services/teamActivityService';
import { logTaskActivity } from './dragAndDropHelpers';

interface DragAndDropProviderProps {
  children: React.ReactNode;
  onTaskStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({
  children,
  onTaskStatusUpdate,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id);
      const dragPreview = document.createElement('div');
      dragPreview.className = 'bg-secondary/50 shadow-md p-2 rounded';
      dragPreview.textContent = task.title;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 0, 0);
      setTimeout(() => {
        document.body.removeChild(dragPreview);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();

    if (!draggedTask) return;

    try {
      if (draggedTask.status === status) return;

      const success = await handleTaskStatusUpdate(draggedTask.id, status);

      if (success) {
        if (onTaskStatusUpdate) {
          onTaskStatusUpdate(draggedTask.id, status as Task['status']);
        }

        // Registrar no histórico de atividades
        await logTaskActivity(draggedTask, status);

        toast({
          title: "Status atualizado",
          description: `Tarefa "${draggedTask.title}" movida para ${
            status === 'todo' ? 'A Fazer' :
            status === 'in-progress' ? 'Em Progresso' :
            status === 'review' ? 'Em Revisão' :
            'Concluído'
          }`,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive"
      });
    } finally {
      setDraggedTask(null);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string): Promise<boolean> => {
    try {
      const isRecurringTask = draggedTask?.isRecurring;

      if (isRecurringTask) {
        const { error } = await supabase
          .from('task_instances')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) {
          console.error('Erro ao atualizar instância de tarefa recorrente:', error);
          return false;
        }
        try {
          const currentUser = supabase.auth.getUser();
          const userId = (await currentUser).data.user?.id || 'anonymous';

          await addActivityEntry({
            user_id: userId,
            action: 'update_status',
            entity_type: 'task',
            entity_id: taskId,
            details: JSON.stringify({
              taskTitle: draggedTask?.title,
              oldStatus: draggedTask?.status,
              newStatus: newStatus
            })
          });
        } catch (historyError) {
          console.error('Erro ao registrar histórico para tarefa recorrente:', historyError);
        }

        return true;
      } else {
        return await updateTaskStatus(taskId, newStatus);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  };

  const contextValue: DragAndDropContextType = {
    draggedTask,
    setDraggedTask,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleTaskStatusUpdate,
  };

  return (
    <DragAndDropContext.Provider value={contextValue}>
      {children}
    </DragAndDropContext.Provider>
  );
};
