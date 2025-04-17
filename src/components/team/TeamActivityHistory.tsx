
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, MessageSquare, FileText, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
  department_name?: string;
  department_color?: string;
}

interface CompletedTask {
  id: string;
  title: string;
  description: string;
  assignee_name: string;
  assignee_avatar: string;
  completed_at: string;
}

export const TeamActivityHistory = () => {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('completed');
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Tentar buscar atividades do time
        try {
          const { data } = await supabase
            .from('team_activity_view')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (data && data.length > 0) {
            setActivities(data as ActivityRecord[]);
          }
        } catch (error) {
          console.error('Erro ao buscar atividades do time:', error);
        }
        
        // Buscar tarefas concluídas
        try {
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select(`
              id,
              title,
              description,
              completed_at,
              assignee:assignee_id (
                id,
                nome,
                avatar_url
              )
            `)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false });
            
          if (tasksError) {
            console.error('Erro ao buscar tarefas concluídas:', tasksError);
          } else if (tasksData && tasksData.length > 0) {
            const formattedTasks = tasksData.map(task => ({
              id: task.id,
              title: task.title,
              description: task.description || '',
              assignee_name: task.assignee?.nome || 'Usuário desconhecido',
              assignee_avatar: task.assignee?.avatar_url || '',
              completed_at: task.completed_at
            }));
            setCompletedTasks(formattedTasks);
          }
          
          // Buscar também instâncias de tarefas recorrentes concluídas
          const { data: taskInstancesData, error: instancesError } = await supabase
            .from('task_instances')
            .select(`
              id,
              title,
              description,
              updated_at,
              assignee:assignee_id (
                id,
                nome,
                avatar_url
              )
            `)
            .eq('status', 'completed')
            .order('updated_at', { ascending: false });
            
          if (instancesError) {
            console.error('Erro ao buscar instâncias de tarefas recorrentes concluídas:', instancesError);
          } else if (taskInstancesData && taskInstancesData.length > 0) {
            const formattedInstances = taskInstancesData.map(task => ({
              id: task.id,
              title: task.title,
              description: task.description || '',
              assignee_name: task.assignee?.nome || 'Usuário desconhecido',
              assignee_avatar: task.assignee?.avatar_url || '',
              completed_at: task.updated_at
            }));
            setCompletedTasks(prev => [...prev, ...formattedInstances]);
          }
        } catch (error) {
          console.error('Erro ao buscar tarefas concluídas:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getActionIcon = (action: string) => {
    switch(action) {
      case 'update_task_status':
        return <CheckSquare className="h-4 w-4" />;
      case 'add_comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'add_attachment':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="completed">Tarefas Concluídas</TabsTrigger>
            <TabsTrigger value="activities">Atividades da Equipe</TabsTrigger>
          </TabsList>
          
          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma tarefa concluída encontrada.
              </div>
            ) : (
              completedTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 border-b border-border pb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={task.assignee_avatar} />
                    <AvatarFallback>{task.assignee_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">{task.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(task.completed_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckSquare className="h-3 w-3 text-green-500" />
                      <span className="text-xs">Concluída por {task.assignee_name}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-4 mt-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade encontrada.
              </div>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 border-b border-border pb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.user_avatar} />
                    <AvatarFallback>{activity.user_name?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">{activity.user_name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {getActionIcon(activity.action)}
                      <span className="text-xs">{activity.department_name || 'Departamento não especificado'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
