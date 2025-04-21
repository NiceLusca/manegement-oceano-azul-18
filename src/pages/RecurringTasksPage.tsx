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
import { RecurringTasksList } from '@/components/recurring/RecurringTasksList';
import { TaskInstancesList } from '@/components/recurring/TaskInstancesList';
import { RecurringTaskForm } from '@/components/recurring/RecurringTaskForm';
import { RecurringTasksHeader } from '@/components/recurring/RecurringTasksHeader';
import { RecurringTasksContainer } from '@/components/recurring/RecurringTasksContainer';

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
      
      const formattedRecurringTasks = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        assigneeId: task.assignee_id || '',
        recurrenceType: task.recurrence_type as 'daily' | 'weekly' | 'monthly' | 'custom',
        customDays: task.custom_days || [],
        customMonths: task.custom_months || [],
        startDate: task.start_date,
        endDate: task.end_date || null,
        lastGenerated: task.last_generated || null,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        projectId: 'default-project' // Add default projectId
      }));
      
      setRecurringTasks(formattedRecurringTasks);
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
        .not('recurring_task_id', 'is', null)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      const mappedInstances = data.map(instance => ({
        id: instance.id,
        recurringTaskId: instance.recurring_task_id || null,
        title: instance.title,
        description: instance.description || '',
        assigneeId: instance.assignee_id || '',
        dueDate: instance.due_date,
        status: instance.status as 'todo' | 'in-progress' | 'review' | 'completed',
        priority: instance.priority as 'low' | 'medium' | 'high',
        createdAt: instance.created_at,
        updatedAt: instance.updated_at,
        projectId: 'default-project' // Add default projectId
      }));
      
      setTaskInstances(mappedInstances);
    } catch (error: any) {
      console.error('Erro ao buscar instâncias de tarefas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as instâncias de tarefas',
        variant: 'destructive',
      });
    }
  }

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

      setShowForm(false);
      form.reset();
      setIsLoading(true);
    } catch (error: any) {
      console.error('Erro ao criar tarefa recorrente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa recorrente',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <RecurringTasksHeader
          onNewTask={() => setShowForm(prev => !prev)}
          showForm={showForm}
        />
        {showForm && (
          <RecurringTaskForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
        <RecurringTasksContainer
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          recurringTasks={recurringTasks}
          setRecurringTasks={setRecurringTasks}
          taskInstances={taskInstances}
          setTaskInstances={setTaskInstances}
        />
      </div>
    </Layout>
  );
};

export default RecurringTasksPage;
