
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCalendar } from './TaskCalendar';
import { CalendarFilters } from './CalendarFilters';
import { DaySummary } from './DaySummary';
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InfoIcon } from 'lucide-react';

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
    // This function no longer needs to check for table existence
    // since the main page will handle this and provide mock data
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          console.error("Erro ao conectar com o banco:", error);
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, [toast]);

  const hasDemo = allTasks.length > 0 && allTasks[0].id === '1';

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
          {hasDemo && (
            <Badge variant="outline" className="text-xs font-normal bg-blue-500/10 text-blue-500 border-blue-200/50 ml-auto flex items-center gap-1">
              <InfoIcon className="h-3 w-3" />
              Demo
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
