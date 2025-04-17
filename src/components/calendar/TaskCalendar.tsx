
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, startOfDay, isSameDay, parseISO } from 'date-fns';
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
    const datesWithTasks = allTasks.reduce<{
      [key: string]: number;
    }>((acc, task) => {
      const dateKey = startOfDay(new Date(task.dueDate)).toISOString();
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});
    return datesWithTasks;
  };
  const datesWithTasks = getDatesWithTasks();

  // Get priority colors for tasks
  const getTaskPriorityColors = () => {
    const taskPriorities: {
      [key: string]: string;
    } = {};
    allTasks.forEach(task => {
      const dateKey = startOfDay(new Date(task.dueDate)).toISOString();

      // Determine highest priority for the day
      if (!taskPriorities[dateKey] || 
          (task.priority === 'high' && taskPriorities[dateKey] !== 'high') || 
          (task.priority === 'medium' && taskPriorities[dateKey] === 'low')) {
        taskPriorities[dateKey] = task.priority;
      }
    });
    return taskPriorities;
  };
  const taskPriorityColors = getTaskPriorityColors();

  // Get color based on priority
  const getPriorityColor = (dateKey: string) => {
    const priority = taskPriorityColors[dateKey];
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'medium') return 'bg-amber-500';
    return 'bg-blue-500';
  };

  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const dateKey = startOfDay(day).toISOString();
    const taskCount = datesWithTasks[dateKey] || 0;
    const priorityColor = getPriorityColor(dateKey);
    const isToday = isSameDay(day, new Date());
    const isSelected = isSameDay(day, date);
    
    return (
      <div className={cn(
        "relative w-full h-full flex flex-col items-center justify-center",
        isSelected && "font-bold text-white bg-purple-500 rounded-full",
        isToday && !isSelected && "font-bold text-purple-500"
      )}>
        <time dateTime={format(day, 'yyyy-MM-dd')} className="text-xs sm:text-sm">
          {format(day, 'd')}
        </time>
        {taskCount > 0 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1 items-center">
            <Badge variant="outline" className={`h-1.5 w-1.5 p-0 rounded-full ${priorityColor}`} />
            {taskCount > 1 && <span className="text-[10px] font-medium">{taskCount}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1">
      <Calendar
        mode="single"
        selected={date}
        onSelect={newDate => newDate && setDate(newDate)}
        locale={ptBR}
        classNames={{
          months: "flex flex-col space-y-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center px-10",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-gray-50 rounded-full",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] py-1.5",
          row: "flex w-full",
          cell: "text-center text-sm p-0 relative h-9 w-9 [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-9 w-9 p-0 font-normal",
          day_selected: "text-white hover:text-white focus:text-white",
          day_today: "text-primary",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
        components={{
          Day: ({ date: day, ...props }) => (
            <button
              {...props}
              className={cn(
                "calendar-cell w-9 h-9 p-0 rounded-full hover:bg-gray-50 focus:outline-none",
                isSameDay(day, date) && "bg-purple-500 text-white hover:bg-purple-600"
              )}
            >
              {renderDay(day)}
            </button>
          )
        }}
      />
    </div>
  );
};

// Helper function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
