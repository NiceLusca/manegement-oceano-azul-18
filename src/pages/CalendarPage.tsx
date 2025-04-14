import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { tasks, teamMembers, getTeamMemberById } from '@/data/mock-data';
import { Task } from '@/types';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckSquare, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [tasksForDate, setTasksForDate] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*');
          
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
            projectId: task.project_id || ''
          }));
          setAllTasks(formattedTasks);
        } else {
          setAllTasks(tasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setAllTasks(tasks);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Update tasks when date changes
  useEffect(() => {
    if (allTasks.length > 0) {
      let filteredTasks = allTasks.filter(task => {
        const taskDate = parseISO(task.dueDate);
        return isSameDay(taskDate, date);
      });
      
      if (activeFilter) {
        filteredTasks = filteredTasks.filter(task => {
          if (activeFilter === 'todo') return task.status === 'todo';
          if (activeFilter === 'in-progress') return task.status === 'in-progress';
          if (activeFilter === 'completed') return task.status === 'completed';
          return true;
        });
      }
      
      setTasksForDate(filteredTasks);
    }
  }, [date, allTasks, activeFilter]);
  
  // Get dates with tasks for highlighting in calendar
  const getDatesWithTasks = () => {
    const datesWithTasks = allTasks.reduce<{ [key: string]: number }>((acc, task) => {
      const dateKey = startOfDay(parseISO(task.dueDate)).toISOString();
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});
    
    return datesWithTasks;
  };
  
  const datesWithTasks = getDatesWithTasks();
  
  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const dateKey = startOfDay(day).toISOString();
    const taskCount = datesWithTasks[dateKey] || 0;
    
    return (
      <div className="relative p-0 calendar-day">
        <time dateTime={format(day, 'yyyy-MM-dd')}>
          {format(day, 'd')}
        </time>
        {taskCount > 0 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <Badge variant="outline" className="h-1.5 w-1.5 p-0 rounded-full bg-primary" />
          </div>
        )}
      </div>
    );
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
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
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'A Fazer';
      case 'in-progress': return 'Em Progresso';
      case 'review': return 'Em Revisão';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Calendário de Tarefas</h1>
          <p className="text-muted-foreground">Visualize as tarefas da equipe por data</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                locale={ptBR}
                className="rounded-md border"
                components={{
                  Day: (props) => (
                    <button {...props}>
                      {renderDay(props.date)}
                    </button>
                  ),
                }}
              />
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Filtrar por status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={activeFilter === null ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setActiveFilter(null)}
                    className="text-xs"
                  >
                    Todos
                  </Button>
                  <Button 
                    variant={activeFilter === 'todo' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setActiveFilter('todo')}
                    className="text-xs"
                  >
                    A Fazer
                  </Button>
                  <Button 
                    variant={activeFilter === 'in-progress' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setActiveFilter('in-progress')}
                    className="text-xs"
                  >
                    Em Progresso
                  </Button>
                  <Button 
                    variant={activeFilter === 'completed' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setActiveFilter('completed')}
                    className="text-xs"
                  >
                    Concluídas
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Resumo do Dia</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      Data:
                    </span>
                    <span className="font-medium">{format(date, 'PPP', { locale: ptBR })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      Total de tarefas:
                    </span>
                    <span className="font-medium">{tasksForDate.length}</span>
                  </div>
                  {tasksForDate.length > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Responsáveis:
                        </span>
                        <span className="font-medium">
                          {Array.from(new Set(tasksForDate.map(t => t.assigneeId))).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Concluídas:
                        </span>
                        <span className="font-medium">
                          {tasksForDate.filter(t => t.status === 'completed').length} de {tasksForDate.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Tarefas para {format(date, 'PPP', { locale: ptBR })}
                {activeFilter && (
                  <Badge className="ml-2" variant="outline">
                    {activeFilter === 'todo' ? 'A Fazer' : 
                     activeFilter === 'in-progress' ? 'Em Progresso' : 
                     'Concluídas'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Carregando tarefas...</p>
                </div>
              ) : tasksForDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma tarefa para esta data{activeFilter ? ' com este filtro' : ''}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasksForDate.map(task => {
                    const assignee = getTeamMemberById(task.assigneeId);
                    
                    return (
                      <Card key={task.id} className="hover-scale">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(task.status)}>
                                {getStatusLabel(task.status)}
                              </Badge>
                              <Badge className={getPriorityColor(task.priority)}>
                                {getPriorityLabel(task.priority)}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {task.description}
                          </p>
                          
                          {assignee && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback>
                                  {assignee.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
