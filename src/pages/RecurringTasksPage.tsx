
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Plus, RefreshCw, User } from 'lucide-react';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RecurringTask, TaskInstance, TeamMember } from '@/types';
import { teamMembers } from '@/data/mock-data';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const recurringTaskFormSchema = z.object({
  title: z.string().min(3, 'O título precisa ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  assigneeId: z.string().min(1, 'Selecione um responsável'),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  startDate: z.string(),
  endDate: z.string().optional(),
});

type RecurringTaskFormValues = z.infer<typeof recurringTaskFormSchema>;

const RecurringTasksPage = () => {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecurringTaskFormValues>({
    resolver: zodResolver(recurringTaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      assigneeId: '',
      recurrenceType: 'daily',
      startDate: new Date().toISOString().substring(0, 10),
    }
  });

  useEffect(() => {
    fetchRecurringTasks();
    fetchTaskInstances();
  }, []);

  async function fetchRecurringTasks() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Explicitly validate the recurrence_type to ensure it matches our allowed values
      const formattedData: RecurringTask[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assigneeId: task.assignee_id,
        recurrenceType: validateRecurrenceType(task.recurrence_type),
        customDays: task.custom_days,
        customMonths: task.custom_months,
        startDate: task.start_date,
        endDate: task.end_date,
        lastGenerated: task.last_generated,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }));
      
      setRecurringTasks(formattedData);
    } catch (error: any) {
      console.error('Erro ao buscar tarefas recorrentes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas recorrentes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTaskInstances() {
    try {
      const { data, error } = await supabase
        .from('task_instances')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Explicitly validate status and priority to ensure they match our allowed values
      const formattedData: TaskInstance[] = data.map(task => ({
        id: task.id,
        recurringTaskId: task.recurring_task_id,
        title: task.title,
        description: task.description,
        assigneeId: task.assignee_id,
        dueDate: task.due_date,
        status: validateTaskStatus(task.status),
        priority: validateTaskPriority(task.priority),
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }));
      
      setTaskInstances(formattedData);
    } catch (error: any) {
      console.error('Erro ao buscar instâncias de tarefas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as instâncias de tarefas',
        variant: 'destructive',
      });
    }
  }

  // Helper function to validate recurrence type
  const validateRecurrenceType = (type: string): RecurringTask['recurrenceType'] => {
    const validTypes: RecurringTask['recurrenceType'][] = ['daily', 'weekly', 'monthly', 'custom'];
    return validTypes.includes(type as any) 
      ? (type as RecurringTask['recurrenceType']) 
      : 'daily'; // Default to daily if invalid
  };

  // Helper function to validate task status
  const validateTaskStatus = (status: string): TaskInstance['status'] => {
    const validStatuses: TaskInstance['status'][] = ['todo', 'in-progress', 'review', 'completed'];
    return validStatuses.includes(status as any) 
      ? (status as TaskInstance['status']) 
      : 'todo'; // Default to todo if invalid
  };

  // Helper function to validate task priority
  const validateTaskPriority = (priority: string): TaskInstance['priority'] => {
    const validPriorities: TaskInstance['priority'][] = ['low', 'medium', 'high'];
    return validPriorities.includes(priority as any) 
      ? (priority as TaskInstance['priority']) 
      : 'medium'; // Default to medium if invalid
  };

  const onSubmit = async (values: RecurringTaskFormValues) => {
    try {
      const { error } = await supabase.from('recurring_tasks').insert({
        title: values.title,
        description: values.description || null,
        assignee_id: values.assigneeId,
        recurrence_type: values.recurrenceType,
        start_date: values.startDate,
        end_date: values.endDate || null,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Tarefa recorrente criada com sucesso',
      });
      
      fetchRecurringTasks();
      setShowForm(false);
      form.reset();
    } catch (error: any) {
      console.error('Erro ao criar tarefa recorrente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa recorrente',
        variant: 'destructive',
      });
    }
  };

  const getRecurrenceLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'custom': return 'Personalizada';
      default: return type;
    }
  };
  
  const getAssigneeName = (assigneeId: string) => {
    const member = teamMembers.find(member => member.id === assigneeId);
    return member ? member.name : 'Não atribuído';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tarefas Recorrentes</h1>
            <p className="text-muted-foreground">Gerencie tarefas periódicas para sua equipe</p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa Recorrente
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nova Tarefa Recorrente</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o título da tarefa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Descrição da tarefa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            {...field}
                          >
                            <option value="">Selecione um responsável</option>
                            {teamMembers.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="recurrenceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Recorrência</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            {...field}
                          >
                            <option value="daily">Diária</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                            <option value="custom">Personalizada</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Término (opcional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Deixe em branco para tarefas sem data de término
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Criar Tarefa Recorrente</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" /> Tarefas Recorrentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Carregando tarefas recorrentes...</p>
              ) : recurringTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma tarefa recorrente encontrada. Crie uma tarefa clicando no botão acima.
                </p>
              ) : (
                <div className="space-y-4">
                  {recurringTasks.map((task) => (
                    <div key={task.id} className="border rounded-md p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge>
                          {getRecurrenceLabel(task.recurrenceType)}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{getAssigneeName(task.assigneeId)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          <span>Início: {formatDate(task.startDate)}</span>
                        </div>
                        {task.endDate && (
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>Término: {formatDate(task.endDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Instâncias de Tarefas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Carregando instâncias de tarefas...</p>
              ) : taskInstances.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma instância de tarefa encontrada. 
                </p>
              ) : (
                <div className="space-y-4">
                  {taskInstances.slice(0, 10).map((task) => (
                    <div key={task.id} className="border rounded-md p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'low' ? 'Baixa' : 
                             task.priority === 'medium' ? 'Média' : 'Alta'}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status === 'todo' ? 'A fazer' : 
                             task.status === 'in-progress' ? 'Em progresso' : 
                             task.status === 'review' ? 'Em revisão' : 'Concluída'}
                          </Badge>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{getAssigneeName(task.assigneeId)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          <span>Prazo: {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RecurringTasksPage;
