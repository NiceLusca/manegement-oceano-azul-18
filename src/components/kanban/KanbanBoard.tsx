
import React, { useState } from 'react';
import { DragAndDropProvider } from '../dragAndDrop/DragAndDropProvider';
import { KanbanColumn } from './KanbanColumn';
import { KanbanHeader } from './KanbanHeader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTasks } from '@/hooks/useTasks';

export function KanbanBoard() {
  const { 
    tasks, 
    isLoading, 
    departmentFilter, 
    setDepartmentFilter,
    changeTaskStatus,
    todoTasks,
    inProgressTasks,
    reviewTasks,
    completedTasks
  } = useTasks();
  
  const [departments, setDepartments] = useState<{id: string, nome: string}[]>([]);
  const { toast } = useToast();
  
  React.useEffect(() => {
    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departamentos')
          .select('id, nome');
          
        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Quadro de Tarefas</h2>
        <div className="flex justify-center py-8">
          <p>Carregando tarefas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <DragAndDropProvider onTaskStatusUpdate={changeTaskStatus}>
      <div className="space-y-4">
        <KanbanHeader 
          departments={departments}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
        />
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn 
            title="A Fazer" 
            tasks={todoTasks} 
            color="bg-gray-100 dark:bg-gray-800" 
          />
          <KanbanColumn 
            title="Em Progresso" 
            tasks={inProgressTasks} 
            color="bg-blue-100 dark:bg-blue-900/40" 
          />
          <KanbanColumn 
            title="Em Revisão" 
            tasks={reviewTasks} 
            color="bg-yellow-100 dark:bg-yellow-900/40" 
          />
          <KanbanColumn 
            title="Concluído" 
            tasks={completedTasks} 
            color="bg-green-100 dark:bg-green-900/40" 
          />
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Dica: Arraste e solte as tarefas para atualizar seu status em tempo real
        </div>
      </div>
    </DragAndDropProvider>
  );
}
