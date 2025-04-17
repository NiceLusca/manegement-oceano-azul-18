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
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const {
          error
        } = await supabase.from('profiles').select('id').limit(1);
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
  return <Card className="lg:col-span-1 border border-gray-100 shadow-sm bg-gray-800">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          Calendário
          {!isLoading && <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-200">
              {allTasks.length} tarefas totais
            </Badge>}
          {hasDemo && <Badge variant="outline" className="text-xs font-normal bg-blue-50 text-blue-500 border-blue-100 ml-auto flex items-center gap-1">
              <InfoIcon className="h-3 w-3" />
              Demo
            </Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 bg-gray-800">
        <TaskCalendar date={date} setDate={setDate} allTasks={allTasks} />
        
        <CalendarFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        
        <DaySummary date={date} tasksForDate={tasksForDate} />
      </CardContent>
    </Card>;
};