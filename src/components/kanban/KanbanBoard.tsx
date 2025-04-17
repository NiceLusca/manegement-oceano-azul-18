
import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { getTasksWithDetails, resetCompletedRecurringTasks } from '@/services/tasks';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { DragAndDropProvider } from '../DragAndDropContext';
import { KanbanColumn } from './KanbanColumn';
import { KanbanHeader } from './KanbanHeader';

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{id: string, nome: string}[]>([]);
  
  useEffect(() => {
    const resetTasks = async () => {
      try {
        const result = await resetCompletedRecurringTasks();
        if (result) {
          console.log('Tarefas recorrentes resetadas com sucesso');
        }
      } catch (error) {
        console.error('Erro ao resetar tarefas recorrentes:', error);
      }
    };
    
    resetTasks();
    
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const timeToMidnight = night.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      resetTasks();
      
      const interval = setInterval(resetTasks, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeToMidnight);
    
    return () => clearTimeout(timer);
  }, []);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      const tasksData = await getTasksWithDetails();
      
      if (tasksData.length > 0) {
        const filteredTasks = departmentFilter 
          ? tasksData.filter(task => 
              task.assignee?.departamento_id === departmentFilter
            )
          : tasksData;
          
        setTasks(filteredTasks.map(task => ({
          ...task,
          status: task.status as Task['status']
        })));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useRealtimeUpdates(
    fetchTasks,
    () => {},
    () => {}
  );
  
  useEffect(() => {
    fetchTasks();
  }, [departmentFilter]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Quadro de Tarefas</h2>
        <div className="flex justify-center py-8">
          <p>Carregando tarefas...</p>
        </div>
      </div>
    );
  }
  
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const reviewTasks = tasks.filter(task => task.status === 'review');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  return (
    <DragAndDropProvider>
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
