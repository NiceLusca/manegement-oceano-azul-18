
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getDepartmentColor } from '@/services/departamentoService';
import { supabase } from '@/integrations/supabase/client';

interface CompletedTask {
  id: string;
  title: string;
  assignee_id: string;
  completed_at: string;
  assignee: {
    nome: string;
    avatar_url: string;
    departamento_id: string;
  };
  department?: {
    nome: string;
    cor: string;
  };
}

export const TeamActivityHistory = () => {
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [departments, setDepartments] = useState<{ id: string, nome: string, cor?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Buscar departamentos
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const { data, error } = await supabase
          .from('departamentos')
          .select('id, nome, cor');

        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
      }
    };

    fetchDepts();
  }, []);

  // Buscar tarefas concluídas
  useEffect(() => {
    const fetchCompletedTasks = async () => {
      setLoading(true);
      try {
        // Criar data de início (00:00) e fim (23:59) para o dia selecionado
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            assignee_id,
            completed_at,
            assignee:profiles(
              nome,
              avatar_url,
              departamento_id
            )
          `)
          .eq('status', 'completed')
          .gte('completed_at', startDate.toISOString())
          .lte('completed_at', endDate.toISOString())
          .order('completed_at', { ascending: false });

        if (error) throw error;

        // Adicionar informações do departamento a cada tarefa
        const tasksWithDepts = (data || []).map(task => {
          const dept = departments.find(d => d.id === task.assignee?.departamento_id);
          return {
            ...task,
            department: dept ? { nome: dept.nome, cor: dept.cor || '#94a3b8' } : undefined
          };
        });

        setCompletedTasks(tasksWithDepts);
      } catch (error) {
        console.error('Erro ao buscar tarefas concluídas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate && departments.length > 0) {
      fetchCompletedTasks();
    }
  }, [selectedDate, departments]);

  // Agrupar tarefas por membro da equipe
  const tasksByMember: Record<string, CompletedTask[]> = {};
  completedTasks.forEach(task => {
    if (!task.assignee_id || !task.assignee) return;
    
    if (!tasksByMember[task.assignee_id]) {
      tasksByMember[task.assignee_id] = [];
    }
    
    tasksByMember[task.assignee_id].push(task);
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Histórico de Atividades Concluídas</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Data:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando atividades...</div>
        ) : Object.keys(tasksByMember).length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Nenhuma atividade concluída nesta data
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByMember).map(([memberId, tasks]) => {
              const member = tasks[0].assignee;
              return (
                <div key={memberId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>{member.nome?.substring(0, 2).toUpperCase() || 'ME'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.nome}</span>
                      {tasks[0].department && (
                        <Badge 
                          className="text-xs" 
                          style={{
                            backgroundColor: tasks[0].department.cor,
                            color: tasks[0].department.cor.startsWith('#E') || tasks[0].department.cor.startsWith('#F') ? 'black' : 'white'
                          }}
                        >
                          {tasks[0].department.nome}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
                    </Badge>
                  </div>
                  
                  <div className="pl-10 space-y-1">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800">
                        <span>{task.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(task.completed_at), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
