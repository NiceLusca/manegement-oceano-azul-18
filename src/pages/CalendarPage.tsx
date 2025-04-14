
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { isSameDay, parseISO } from 'date-fns';
import { Task } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { CalendarContainer } from '@/components/calendar/CalendarContainer';
import { TaskList } from '@/components/calendar/TaskList';

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [tasksForDate, setTasksForDate] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
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
        } else {
          setAllTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setAllTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
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
          <h1 className="text-3xl font-bold">Calendário de Tarefas</h1>
          <p className="text-muted-foreground">Visualize as tarefas da equipe por data</p>
        </div>
        
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
