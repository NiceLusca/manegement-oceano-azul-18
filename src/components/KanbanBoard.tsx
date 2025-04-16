import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tasks as mockTasks, getTeamMemberById, projects } from '@/data/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useDragAndDrop, DragAndDropProvider } from '@/components/DragAndDropContext';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  color: string;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, status: string) => void;
}

const KanbanColumn = ({ title, tasks, color, onDragStart, onDragOver, onDrop }: KanbanColumnProps) => {
  return (
    <Card 
      className="flex-1 min-w-[250px] shadow-md"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop && onDrop(e, title === "A Fazer" ? "todo" : 
                                       title === "Em Progresso" ? "in-progress" : 
                                       title === "Em Revisão" ? "review" : "completed")}
    >
      <CardHeader className={`pb-2 ${color}`}>
        <CardTitle className="text-sm font-semibold">{title} ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-2 overflow-y-auto max-h-[calc(100vh-250px)]">
        <div className="space-y-2">
          {tasks.map((task) => {
            const assignee = getTeamMemberById(task.assigneeId);
            const project = projects.find(p => p.id === task.projectId);
            
            return (
              <Card 
                key={task.id} 
                className="hover-scale shadow-sm cursor-move" 
                draggable
                onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
              >
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm mb-1">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <Badge variant="outline" className="text-xs font-normal">
                      {project?.name || "Sem categoria"}
                    </Badge>
                    <Badge 
                      variant={
                        task.priority === 'low' ? 'outline' :
                        task.priority === 'medium' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {task.priority === 'low' ? 'Baixa' : 
                       task.priority === 'medium' ? 'Média' : 'Alta'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                    {assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback>{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const DraggableKanbanColumn = ({ title, tasks, color }: KanbanColumnProps) => {
  const { handleDragOver, handleDrop, handleDragStart } = useDragAndDrop();
  const statusMap = {
    "A Fazer": "todo",
    "Em Progresso": "in-progress",
    "Em Revisão": "review",
    "Concluído": "completed"
  };
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
          {tasks.map((task) => {
            const assignee = getTeamMemberById(task.assigneeId);
            const project = projects.find(p => p.id === task.projectId);
            
            return (
              <Card 
                key={task.id} 
                className="hover-scale shadow-sm cursor-move" 
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm mb-1">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <Badge variant="outline" className="text-xs font-normal">
                      {project?.name || "Sem categoria"}
                    </Badge>
                    <Badge 
                      variant={
                        task.priority === 'low' ? 'outline' :
                        task.priority === 'medium' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {task.priority === 'low' ? 'Baixa' : 
                       task.priority === 'medium' ? 'Média' : 'Alta'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                    {assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback>{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{id: string, nome: string}[]>([]);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      let query = supabase.from('tasks').select('*');
      
      if (departmentFilter) {
        query = query.eq('profiles.departamento_id', departmentFilter);
      }
      
      const { data, error } = await query;
          
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedTasks = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status as 'todo' | 'in-progress' | 'review' | 'completed',
          assigneeId: task.assignee_id || '',
          dueDate: task.due_date || new Date().toISOString(),
          priority: task.priority as 'low' | 'medium' | 'high',
          projectId: 'default-category'
        }));
        setTasks(formattedTasks);
      } else {
        setTasks(mockTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departamentos')
        .select('id, nome');
        
      if (error) throw error;
      
      if (data) {
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
  
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { updateTaskStatus } = await import('@/services/taskService');
      const success = await updateTaskStatus(taskId, newStatus);
      
      if (success) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus as any } : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };
  
  useRealtimeUpdates(
    fetchTasks,
    () => {},
    () => {}
  );
  
  useEffect(() => {
    fetchTasks();
    fetchDepartments();
  }, [departmentFilter]);
  
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const reviewTasks = tasks.filter(task => task.status === 'review');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
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
  
  return (
    <DragAndDropProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Quadro de Tarefas</h2>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtrar por departamento:</span>
            <Select
              value={departmentFilter || ""}
              onValueChange={(value) => setDepartmentFilter(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os departamentos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          <DraggableKanbanColumn 
            title="A Fazer" 
            tasks={todoTasks} 
            color="bg-gray-100 dark:bg-gray-800" 
          />
          <DraggableKanbanColumn 
            title="Em Progresso" 
            tasks={inProgressTasks} 
            color="bg-blue-100 dark:bg-blue-900/40" 
          />
          <DraggableKanbanColumn 
            title="Em Revisão" 
            tasks={reviewTasks} 
            color="bg-yellow-100 dark:bg-yellow-900/40" 
          />
          <DraggableKanbanColumn 
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
