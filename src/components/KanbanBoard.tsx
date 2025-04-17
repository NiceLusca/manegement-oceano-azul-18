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
import { CalendarClock } from 'lucide-react';
import { getTasksWithDetails, resetCompletedRecurringTasks } from '@/services/tasks';
import { useToast } from '@/hooks/use-toast';

const DraggableKanbanColumn = ({ title, tasks, color }: { 
  title: string, 
  tasks: Task[], 
  color: string 
}) => {
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
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm mb-1">{task.title}</h3>
                    {task.isRecurring && (
                      <Badge variant="outline" className="ml-1 bg-[#D0E9FF] text-[#005B99] border-[#D0E9FF]/70 flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
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
  const { toast } = useToast();
  
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
          ? tasksData.filter(task => task.assignee?.departamento_id === departmentFilter)
          : tasksData;
          
        setTasks(filteredTasks);
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
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) {
        console.error('Tarefa não encontrada');
        return;
      }
      
      const table = task.isRecurring ? 'task_instances' : 'tasks';
      const { error } = await supabase
        .from(table)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);
      
      if (error) {
        console.error(`Erro ao atualizar tarefa em ${table}:`, error);
        return;
      }
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus as any } : task
        )
      );
      
      try {
        await supabase
          .from('team_activity_view')
          .insert([
            {
              user_id: task.assigneeId,
              action: 'update_task_status',
              entity_type: 'task',
              entity_id: taskId,
              details: `Status da tarefa "${task.title}" alterado para ${newStatus === 'todo' ? 'A Fazer' : 
                                                                            newStatus === 'in-progress' ? 'Em Progresso' : 
                                                                            newStatus === 'review' ? 'Em Revisão' : 'Concluído'}`
            }
          ]);
      } catch (historyError: any) {
        if (!historyError.message?.includes('does not exist')) {
          console.error('Erro ao registrar no histórico:', historyError);
        }
      }
      
      toast({
        title: "Status atualizado",
        description: `Tarefa "${task.title}" movida para ${
          newStatus === 'todo' ? 'A Fazer' : 
          newStatus === 'in-progress' ? 'Em Progresso' : 
          newStatus === 'review' ? 'Em Revisão' : 'Concluído'
        }`,
      });
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
              value={departmentFilter || "all"}
              onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
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
