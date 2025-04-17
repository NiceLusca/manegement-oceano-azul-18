
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { isSameDay, parseISO } from 'date-fns';
import { Task } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { CalendarContainer } from '@/components/calendar/CalendarContainer';
import { TaskList } from '@/components/calendar/TaskList';
import { AlertCircle, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [tasksForDate, setTasksForDate] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { toast } = useToast();
  
  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*');
          
        if (error) {
          if (error.message.includes("does not exist")) {
            setError("A tabela de tarefas não existe no banco de dados");
            setIsDemoMode(true);
            // Set demo tasks since the table doesn't exist
            setDemoTasks();
          } else {
            throw error;
          }
        } else if (data && data.length > 0) {
          const formattedTasks = data.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            status: task.status as 'todo' | 'in-progress' | 'review' | 'completed',
            assigneeId: task.assignee_id || '',
            dueDate: task.due_date || new Date().toISOString(),
            priority: task.priority as 'low' | 'medium' | 'high',
            projectId: 'default-category' // Assign a default projectId since it's not in the database
          }));
          setAllTasks(formattedTasks);
          setIsDemoMode(false);
        } else {
          // If there's no data, use demo tasks
          setIsDemoMode(true);
          setDemoTasks();
        }
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        setError(`Erro ao carregar tarefas: ${error.message}`);
        setIsDemoMode(true);
        // Use demo tasks as fallback
        setDemoTasks();
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  const setDemoTasks = () => {
    const demoTasks: Task[] = [
      {
        id: '1',
        title: 'Revisar proposta de marketing',
        description: 'Análise da proposta para o cliente XYZ',
        status: 'todo' as const,
        assigneeId: '101',
        dueDate: new Date().toISOString(),
        priority: 'medium',
        projectId: 'marketing'
      },
      {
        id: '2',
        title: 'Atualizar site institucional',
        description: 'Incorporar novas seções de produtos',
        status: 'in-progress' as const,
        assigneeId: '102',
        dueDate: new Date().toISOString(),
        priority: 'high',
        projectId: 'website'
      },
      {
        id: '3',
        title: 'Preparar relatório mensal',
        description: 'Compilar dados de performance de abril',
        status: 'todo' as const,
        assigneeId: '103',
        dueDate: new Date().toISOString(),
        priority: 'low',
        projectId: 'reporting'
      }
    ];
    setAllTasks(demoTasks);
    toast({
      title: "Usando dados de demonstração",
      description: "A tabela de tarefas não existe. Mostrando dados de exemplo.",
      variant: "default",
    });
  };
  
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
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendário de Tarefas</h1>
          <p className="text-muted-foreground">Visualize as tarefas da equipe por data</p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-2"
              >
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {isDemoMode && (
          <Alert variant="default" className="bg-blue-500/10 text-blue-500 border-blue-200/50">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Usando dados de demonstração</AlertTitle>
            <AlertDescription>
              A tabela de tarefas não existe. Mostrando dados de exemplo.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CalendarContainer 
            date={date}
            setDate={setDate}
            allTasks={allTasks}
            tasksForDate={tasksForDate}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
          
          <TaskList 
            date={date}
            tasksForDate={tasksForDate}
            loading={loading}
            activeFilter={activeFilter}
          />
        </div>
      </div>
    </Layout>
  );
}
