
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCalendar } from './TaskCalendar';
import { CalendarFilters } from './CalendarFilters';
import { DaySummary } from './DaySummary';
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CalendarContainerProps {
  date: Date;
  setDate: (date: Date) => void;
  allTasks: Task[];
  tasksForDate: Task[];
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  date,
  setDate,
  allTasks,
  tasksForDate,
  activeFilter,
  setActiveFilter
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Verificar se a tabela 'tasks' existe no banco de dados
    const checkTasksTable = async () => {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('tasks')
          .select('id')
          .limit(1);
        
        if (error && error.message.includes("does not exist")) {
          toast({
            title: "Erro ao carregar tarefas",
            description: "A tabela de tarefas não existe no banco de dados.",
            variant: "destructive",
          });
          console.error("Erro: A tabela 'tasks' não existe no banco de dados");
        }
      } catch (error) {
        console.error("Erro ao verificar tabela tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkTasksTable();
  }, [toast]);

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          Calendário
          {!isLoading && (
            <Badge variant="outline" className="text-xs font-normal">
              {allTasks.length} tarefas totais
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-card/50 rounded-md p-0 border border-border/50">
          <TaskCalendar 
            date={date} 
            setDate={setDate} 
            allTasks={allTasks} 
          />
        </div>
        
        <CalendarFilters 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />
        
        <DaySummary 
          date={date} 
          tasksForDate={tasksForDate} 
        />
      </CardContent>
    </Card>
  );
};
