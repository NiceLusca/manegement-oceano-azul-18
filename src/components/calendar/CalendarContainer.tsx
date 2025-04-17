
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCalendar } from './TaskCalendar';
import { CalendarFilters } from './CalendarFilters';
import { DaySummary } from './DaySummary';
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';

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
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          Calendário
          <Badge variant="outline" className="text-xs font-normal">
            {allTasks.length} tarefas totais
          </Badge>
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
