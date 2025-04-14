
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, startOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task } from '@/types';

interface TaskCalendarProps {
  date: Date;
  setDate: (date: Date) => void;
  allTasks: Task[];
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ 
  date, 
  setDate, 
  allTasks 
}) => {
  // Get dates with tasks for highlighting in calendar
  const getDatesWithTasks = () => {
    const datesWithTasks = allTasks.reduce<{ [key: string]: number }>((acc, task) => {
      const dateKey = startOfDay(new Date(task.dueDate)).toISOString();
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});
    
    return datesWithTasks;
  };
  
  const datesWithTasks = getDatesWithTasks();
  
  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const dateKey = startOfDay(day).toISOString();
    const taskCount = datesWithTasks[dateKey] || 0;
    
    return (
      <div className="relative p-0 calendar-day">
        <time dateTime={format(day, 'yyyy-MM-dd')}>
          {format(day, 'd')}
        </time>
        {taskCount > 0 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <Badge variant="outline" className="h-1.5 w-1.5 p-0 rounded-full bg-primary" />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={(newDate) => newDate && setDate(newDate)}
      locale={ptBR}
      className="rounded-md border"
      components={{
        Day: ({ date: day, ...props }) => (
          <button {...props}>
            {renderDay(day)}
          </button>
        ),
      }}
    />
  );
};
