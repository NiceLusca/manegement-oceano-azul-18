
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCalendar } from './TaskCalendar';
import { CalendarFilters } from './CalendarFilters';
import { DaySummary } from './DaySummary';
import { Task } from '@/types';

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
      <CardHeader>
        <CardTitle>Calendário</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskCalendar 
          date={date} 
          setDate={setDate} 
          allTasks={allTasks} 
        />
        
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
