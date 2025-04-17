
import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Task } from '@/types';
import { updateTaskStatus } from '@/services/tasks';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Interface do contexto
interface DragAndDropContextType {
  draggedTask: Task | null;
  setDraggedTask: (task: Task | null) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, status: string) => Promise<void>;
  handleTaskStatusUpdate: (taskId: string, newStatus: string) => Promise<boolean>;
}

// Props do Provider
interface DragAndDropProviderProps {
  children: ReactNode;
  onTaskStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
}

// Criação do contexto
const DragAndDropContext = createContext<DragAndDropContextType | undefined>(undefined);

// Provider do contexto
export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ 
  children, 
  onTaskStatusUpdate 
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  // Função para iniciar o arraste
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
    
    // Definir a aparência do elemento arrastado
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id);
      
      // Adicionar uma imagem fantasma personalizada (opcional)
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

  // Função para permitir o arraste sobre uma área
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Definir o efeito visual ao arrastar sobre uma área válida
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  // Função para tratar o drop em uma coluna
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    try {
      // Não atualizar se o status for o mesmo
      if (draggedTask.status === status) return;
      
      // Atualizar o status da tarefa no servidor
      const success = await handleTaskStatusUpdate(draggedTask.id, status);
      
      if (success) {
        // Atualizar o estado local imediatamente
        if (onTaskStatusUpdate) {
          onTaskStatusUpdate(draggedTask.id, status as Task['status']);
        }
        
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
      // Limpar o estado após o drop
      setDraggedTask(null);
    }
  };

  // Função para atualizar o status no backend
  const handleTaskStatusUpdate = async (taskId: string, newStatus: string): Promise<boolean> => {
    try {
      // Verificar se é uma tarefa recorrente ou regular
      const isRecurringTask = draggedTask?.isRecurring;
      
      if (isRecurringTask) {
        // Atualizar instância de tarefa recorrente
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
        
        // Registrar atividade na tabela de histórico se existir
        try {
          // Skip activity logging if user is dragging tasks quickly
          console.log('Atividade de tarefa atualizada:', {
            user_id: draggedTask?.assigneeId,
            action: 'update_task_status',
            entity_type: 'recurring_task',
            entity_id: draggedTask?.recurringTaskId,
            details: `Status da tarefa recorrente "${draggedTask?.title}" alterado`
          });
        } catch (historyError: any) {
          // Ignorar erros se a tabela não existir
          console.error('Erro ao registrar histórico:', historyError);
        }
      } else {
        // É uma tarefa regular, usar a função existente
        return await updateTaskStatus(taskId, newStatus);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  };

  // Valor do contexto
  const contextValue: DragAndDropContextType = {
    draggedTask,
    setDraggedTask,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleTaskStatusUpdate
  };

  return (
    <DragAndDropContext.Provider value={contextValue}>
      {children}
    </DragAndDropContext.Provider>
  );
};

// Hook para usar o contexto
export const useDragAndDrop = () => {
  const context = useContext(DragAndDropContext);
  if (context === undefined) {
    throw new Error('useDragAndDrop deve ser usado dentro de um DragAndDropProvider');
  }
  return context;
};
