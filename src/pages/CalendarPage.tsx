
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { tasks, getTeamMemberById } from '@/data/mock-data';
import { Task } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { DayContentProps } from 'react-day-picker';

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from the database or use mock data
  useEffect(() => {
    const fetchTasks = async () => {
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
            projectId: 'default-project'
          }));
          setAllTasks(formattedTasks);
        } else {
          // Use mock data if no data in database
          setAllTasks(tasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Fallback to mock data
        setAllTasks(tasks);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Update tasks for selected date when date changes
  useEffect(() => {
    if (date) {
      const selectedDateStr = date.toISOString().split('T')[0];
      
      const filteredTasks = allTasks.filter(task => {
        const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
        return taskDate === selectedDateStr;
      });
      
      setTasksForSelectedDate(filteredTasks);
    } else {
      setTasksForSelectedDate([]);
    }
  }, [date, allTasks]);

  // Find dates with tasks to highlight in the calendar
  const datesWithTasks = allTasks.reduce((dates, task) => {
    const taskDate = new Date(task.dueDate);
    const dateStr = taskDate.toISOString().split('T')[0];
    if (!dates.includes(dateStr)) {
      dates.push(dateStr);
    }
    return dates;
  }, [] as string[]);

  // Custom renderer for days with tasks
  const renderDay = (props: DayContentProps) => {
    const dateStr = props.date.toISOString().split('T')[0];
    const hasTasksForDate = datesWithTasks.includes(dateStr);
    
    return hasTasksForDate ? (
      <div className="relative">
        {props.date.getDate()}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="h-1 w-1 rounded-full bg-primary"></div>
        </div>
      </div>
    ) : (
      <div>{props.date.getDate()}</div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Calendário de Tarefas</h1>
        <p className="text-muted-foreground">Visualize e gerencie o cronograma de tarefas da sua equipe.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                components={{
                  DayContent: renderDay
                }}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {date ? (
                  `Tarefas para ${date.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}`
                ) : 'Nenhuma data selecionada'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Carregando tarefas...</p>
              ) : tasksForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {tasksForSelectedDate.map(task => {
                    const assignee = getTeamMemberById(task.assigneeId);
                    
                    return (
                      <div key={task.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          </div>
                          <Badge
                            variant={
                              task.priority === 'low' ? 'outline' :
                              task.priority === 'medium' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {task.priority === 'low' ? 'Baixa' : 
                             task.priority === 'medium' ? 'Média' : 'Alta'}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <Badge
                            variant={
                              task.status === 'todo' ? 'outline' :
                              task.status === 'in-progress' ? 'default' :
                              task.status === 'review' ? 'secondary' :
                              'outline'
                            }
                            className={
                              task.status === 'completed' ? 'bg-green-500 hover:bg-green-600 text-white' : ''
                            }
                          >
                            {task.status === 'todo' ? 'A Fazer' : 
                             task.status === 'in-progress' ? 'Em Progresso' : 
                             task.status === 'review' ? 'Em Revisão' : 
                             'Concluído'}
                          </Badge>
                          
                          {assignee && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Responsável:</span>
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback>{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma tarefa para esta data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;
