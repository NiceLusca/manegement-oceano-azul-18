
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, Filter, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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

interface MemberActivitySummary {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  departmentId: string | null;
  departmentName: string | null;
  departmentColor: string | null;
  taskCount: number;
  tasks: CompletedTask[];
}

export const TeamActivityHistory = () => {
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [departments, setDepartments] = useState<{ id: string, nome: string, cor?: string }[]>([]);
  const [members, setMembers] = useState<{ id: string, nome: string, departamento_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasksByMember, setTasksByMember] = useState<Record<string, MemberActivitySummary>>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'group' | 'table'>('group');
  const [exportLoading, setExportLoading] = useState(false);
  const { toast } = useToast();

  // Buscar departamentos
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const { data, error } = await supabase
          .from('departamentos')
          .select('id, nome, cor')
          .order('nome');

        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
      }
    };

    fetchDepts();
  }, []);

  // Buscar membros
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome, departamento_id')
          .order('nome');

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Erro ao buscar membros:', error);
      }
    };

    fetchMembers();
  }, []);

  // Buscar tarefas concluídas
  useEffect(() => {
    const fetchCompletedTasks = async () => {
      if (!selectedDate) return;
      
      setLoading(true);
      try {
        // Criar data de início (00:00) e fim (23:59) para o dia selecionado
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        let query = supabase
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
          .lte('completed_at', endDate.toISOString());

        // Aplicar filtro por membro se selecionado
        if (selectedMember) {
          query = query.eq('assignee_id', selectedMember);
        }

        // Aplicar filtro por departamento (através do membro) se selecionado
        // Não podemos filtrar diretamente, então teremos que filtrar depois
        
        const { data, error } = await query.order('completed_at', { ascending: false });

        if (error) throw error;

        // Adicionar informações do departamento a cada tarefa
        const tasksWithDepts = (data || []).map(task => {
          // Verificamos se assignee existe e é um objeto único (não um array)
          const assigneeInfo = task.assignee && !Array.isArray(task.assignee) 
            ? task.assignee 
            : { nome: '', avatar_url: '', departamento_id: '' };
            
          const dept = departments.find(d => d.id === assigneeInfo.departamento_id);
          
          return {
            ...task,
            assignee: assigneeInfo,
            department: dept ? { nome: dept.nome, cor: dept.cor || '#94a3b8' } : undefined
          } as CompletedTask;
        });

        // Aplicar filtro por departamento se selecionado
        const filteredTasks = selectedDepartment
          ? tasksWithDepts.filter(task => task.assignee?.departamento_id === selectedDepartment)
          : tasksWithDepts;

        setCompletedTasks(filteredTasks);
        
        // Agrupar por membro da equipe
        const byMember: Record<string, MemberActivitySummary> = {};
        
        filteredTasks.forEach(task => {
          if (!task.assignee_id || !task.assignee) return;
          
          if (!byMember[task.assignee_id]) {
            const department = departments.find(d => d.id === task.assignee.departamento_id);
            
            byMember[task.assignee_id] = {
              memberId: task.assignee_id,
              memberName: task.assignee.nome || 'Sem nome',
              memberAvatar: task.assignee.avatar_url || '',
              departmentId: task.assignee.departamento_id || null,
              departmentName: department?.nome || null,
              departmentColor: department?.cor || null,
              taskCount: 0,
              tasks: []
            };
          }
          
          byMember[task.assignee_id].taskCount += 1;
          byMember[task.assignee_id].tasks.push(task);
        });
        
        setTasksByMember(byMember);
      } catch (error) {
        console.error('Erro ao buscar tarefas concluídas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate && departments.length > 0) {
      fetchCompletedTasks();
    }
  }, [selectedDate, departments, selectedDepartment, selectedMember]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleExportCSV = () => {
    setExportLoading(true);
    
    try {
      // Criar cabeçalho do CSV
      let csvContent = "Nome,Departamento,Total de Tarefas,Tarefas\n";
      
      // Adicionar dados de cada membro
      Object.values(tasksByMember).forEach(member => {
        const taskTitles = member.tasks.map(t => t.title).join(" | ");
        
        csvContent += `"${member.memberName}","${member.departmentName || 'Sem departamento'}",${member.taskCount},"${taskTitles}"\n`;
      });
      
      // Criar link de download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `atividades_${format(selectedDate, 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Histórico de Atividades Concluídas</CardTitle>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Filtros:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                    size="sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedDepartment || "all"}
                onValueChange={(value) => setSelectedDepartment(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[180px]" size="sm">
                  <SelectValue placeholder="Todos departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: dept.cor || '#94a3b8' }}
                        />
                        {dept.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedMember || "all"}
                onValueChange={(value) => setSelectedMember(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[180px]" size="sm">
                  <SelectValue placeholder="Todos membros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos membros</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={handleExportCSV}
            disabled={exportLoading || loading || Object.keys(tasksByMember).length === 0}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="group" className="mt-2" onValueChange={(v) => setViewMode(v as 'group' | 'table')}>
          <TabsList className="mb-4">
            <TabsTrigger value="group">Agrupado por Membro</TabsTrigger>
            <TabsTrigger value="table">Tabela de Atividades</TabsTrigger>
          </TabsList>
          
          <TabsContent value="group">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                    <div className="pl-10 space-y-1">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : Object.keys(tasksByMember).length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma atividade concluída encontrada
              </div>
            ) : (
              <div className="space-y-6">
                {Object.values(tasksByMember).map((member) => (
                  <div key={member.memberId} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.memberAvatar} />
                        <AvatarFallback>{getInitials(member.memberName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.memberName}</span>
                        {member.departmentName && (
                          <Badge 
                            className="text-xs" 
                            style={{
                              backgroundColor: member.departmentColor || '#94a3b8',
                              color: (member.departmentColor && 
                                    (member.departmentColor.startsWith('#E') || 
                                     member.departmentColor.startsWith('#F') || 
                                     member.departmentColor.startsWith('#e') || 
                                     member.departmentColor.startsWith('#f'))) 
                                ? 'black' 
                                : 'white'
                            }}
                          >
                            {member.departmentName}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {member.taskCount} {member.taskCount === 1 ? 'tarefa' : 'tarefas'}
                      </Badge>
                    </div>
                    
                    <div className="pl-10 space-y-1">
                      {member.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800">
                          <span>{task.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(task.completed_at), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="table">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : completedTasks.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma atividade concluída encontrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="text-right">Hora de Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar_url} />
                            <AvatarFallback>{getInitials(task.assignee.nome)}</AvatarFallback>
                          </Avatar>
                          <span>{task.assignee.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>
                        {task.department ? (
                          <Badge 
                            className="text-xs" 
                            style={{
                              backgroundColor: task.department.cor,
                              color: task.department.cor.startsWith('#E') ||
                                     task.department.cor.startsWith('#F') ||
                                     task.department.cor.startsWith('#e') ||
                                     task.department.cor.startsWith('#f')
                                ? 'black' 
                                : 'white'
                            }}
                          >
                            {task.department.nome}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {format(new Date(task.completed_at), 'HH:mm', { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
