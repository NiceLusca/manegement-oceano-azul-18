
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDepartmentFilter } from '@/hooks/useDepartmentFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarIcon, 
  Download, 
  Filter, 
  Loader2, 
  RefreshCw, 
  Table as TableIcon, 
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ActivityRecord {
  id: string;
  memberId: string;
  memberName: string;
  departmentId: string;
  departmentName: string;
  taskTitle: string;
  description: string;
  completedAt: string;
  status: string;
}

interface DailyActivity {
  day: string;
  date: Date;
  activities: ActivityRecord[];
}

interface TeamMember {
  id: string;
  name: string;
}

export function TeamActivityHistory() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [groupedByDay, setGroupedByDay] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'custom'>('thisWeek');
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [memberFilter, setMemberFilter] = useState<string | null>(null);
  const [membersList, setMembersList] = useState<TeamMember[]>([]);
  const [exporting, setExporting] = useState(false);
  
  const { departments, selectedDepartment, setSelectedDepartment, getDepartmentName } = useDepartmentFilter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch team members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome')
          .order('nome');
          
        if (error) throw error;
        
        setMembersList(
          data?.map(member => ({
            id: member.id,
            name: member.nome || 'Sem nome'
          })) || []
        );
      } catch (error) {
        console.error('Erro ao buscar membros da equipe:', error);
      }
    };
    
    fetchMembers();
  }, []);
  
  // Generate query based on filters
  const generateQuery = () => {
    let query = supabase.from('team_activity')
      .select('*')
      .order('completed_at', { ascending: false });
    
    // Add date filters
    const now = new Date();
    
    if (dateFilter === 'today') {
      const today = format(now, 'yyyy-MM-dd');
      query = query.gte('completed_at', `${today}T00:00:00`).lte('completed_at', `${today}T23:59:59`);
    }
    else if (dateFilter === 'yesterday') {
      const yesterday = format(new Date(now.setDate(now.getDate() - 1)), 'yyyy-MM-dd');
      query = query.gte('completed_at', `${yesterday}T00:00:00`).lte('completed_at', `${yesterday}T23:59:59`);
    }
    else if (dateFilter === 'thisWeek') {
      const today = new Date();
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDay = new Date(new Date().setDate(firstDay.getDate() + 6));
      
      query = query.gte('completed_at', format(firstDay, 'yyyy-MM-dd'))
                  .lte('completed_at', format(lastDay, 'yyyy-MM-dd') + 'T23:59:59');
    }
    else if (dateFilter === 'thisMonth') {
      const firstDayOfMonth = format(startOfMonth(now), 'yyyy-MM-dd');
      const lastDayOfMonth = format(endOfMonth(now), 'yyyy-MM-dd');
      
      query = query.gte('completed_at', `${firstDayOfMonth}T00:00:00`)
                  .lte('completed_at', `${lastDayOfMonth}T23:59:59`);
    }
    else if (dateFilter === 'custom' && dateRange.from && dateRange.to) {
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');
      
      query = query.gte('completed_at', `${fromDate}T00:00:00`)
                  .lte('completed_at', `${toDate}T23:59:59`);
    }
    
    // Add department filter
    if (selectedDepartment) {
      query = query.eq('department_id', selectedDepartment);
    }
    
    // Add member filter
    if (memberFilter) {
      query = query.eq('member_id', memberFilter);
    }
    
    return query;
  };
  
  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    
    try {
      const query = generateQuery();
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const formattedData = data.map(record => ({
          id: record.id,
          memberId: record.member_id,
          memberName: record.member_name,
          departmentId: record.department_id,
          departmentName: record.department_name,
          taskTitle: record.task_title,
          description: record.description,
          completedAt: record.completed_at,
          status: record.status
        }));
        
        setActivities(formattedData);
        
        // Group by day
        const grouped: Record<string, ActivityRecord[]> = {};
        
        formattedData.forEach(activity => {
          const day = format(new Date(activity.completedAt), 'yyyy-MM-dd');
          if (!grouped[day]) {
            grouped[day] = [];
          }
          grouped[day].push(activity);
        });
        
        const result: DailyActivity[] = Object.keys(grouped)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .map(day => ({
            day,
            date: new Date(day),
            activities: grouped[day]
          }));
        
        setGroupedByDay(result);
      }
    } catch (error: any) {
      console.error('Erro ao buscar atividades:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as atividades: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchActivities();
  }, [selectedDepartment, dateFilter, dateRange, memberFilter]);
  
  const formatDay = (date: Date) => {
    if (isToday(date)) {
      return 'Hoje';
    } else if (isYesterday(date)) {
      return 'Ontem';
    } else {
      return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
    }
  };
  
  const exportToCsv = async () => {
    setExporting(true);
    
    try {
      // Build CSV content
      let csvContent = "Data,Membro,Departamento,Tarefa,Descrição,Status\n";
      
      activities.forEach(activity => {
        const date = format(new Date(activity.completedAt), 'dd/MM/yyyy HH:mm');
        const row = [
          date,
          activity.memberName,
          activity.departmentName,
          activity.taskTitle,
          `"${activity.description.replace(/"/g, '""')}"`,
          activity.status
        ].join(',');
        
        csvContent += row + "\n";
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const exportFileName = `atividades_equipe_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      if (navigator.msSaveBlob) {
        // For IE
        navigator.msSaveBlob(blob, exportFileName);
      } else {
        // For other browsers
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', exportFileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: "Exportação concluída",
        description: "O arquivo CSV foi gerado com sucesso",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Erro ao exportar atividades:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar as atividades: " + error.message,
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };
  
  const getFormattedDateRange = () => {
    if (dateFilter === 'today') {
      return 'Hoje';
    } else if (dateFilter === 'yesterday') {
      return 'Ontem';
    } else if (dateFilter === 'thisWeek') {
      return 'Esta semana';
    } else if (dateFilter === 'thisMonth') {
      return 'Este mês';
    } else if (dateFilter === 'custom' && dateRange.from && dateRange.to) {
      const from = format(dateRange.from, 'dd/MM/yyyy');
      const to = format(dateRange.to, 'dd/MM/yyyy');
      return `${from} - ${to}`;
    }
    return '';
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle>Histórico de Atividades</CardTitle>
          <CardDescription>
            Acompanhe as atividades concluídas pela equipe
          </CardDescription>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'table')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchActivities}
            className="sm:ml-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCsv}
            disabled={exporting || activities.length === 0}
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 mb-6 overflow-x-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          <Select
            value={dateFilter}
            onValueChange={(value) => setDateFilter(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Período</SelectLabel>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="thisWeek">Esta semana</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          {dateFilter === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    format(dateRange.from, 'dd/MM/yyyy') + ' - ' + format(dateRange.to, 'dd/MM/yyyy')
                  ) : (
                    "Selecione um período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({
                        from: range.from,
                        to: range.to
                      });
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          
          <Select
            value={selectedDepartment || ""}
            onValueChange={(value) => setSelectedDepartment(value === "" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <TableIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Departamento</SelectLabel>
                <SelectItem value="">Todos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.nome}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select
            value={memberFilter || ""}
            onValueChange={(value) => setMemberFilter(value === "" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Membro" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Membro</SelectLabel>
                <SelectItem value="">Todos</SelectItem>
                {membersList.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  {[1, 2].map(j => (
                    <div key={j} className="flex items-start space-x-4 p-4 border rounded-md">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-10">
            <TableIcon className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-lg font-medium">Nenhuma atividade encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros para ver mais resultados
            </p>
          </div>
        ) : (
          <TabsContent value="list" className="mt-0">
            <div className="space-y-8">
              {groupedByDay.map((group) => (
                <div key={group.day} className="space-y-4">
                  <h3 className="font-medium text-lg capitalize">
                    {formatDay(group.date)}
                  </h3>
                  
                  <div className="space-y-4">
                    {group.activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start space-x-4 p-4 border rounded-md"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: activity.departmentId ? departments.find(d => d.id === activity.departmentId)?.cor || '#94a3b8' : '#94a3b8' }}
                        >
                          {activity.memberName.substring(0, 1).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{activity.memberName}</span>
                              <Badge variant="outline" className="ml-2">
                                {activity.departmentName}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(activity.completedAt), 'HH:mm')}
                            </span>
                          </div>
                          
                          <p className="mt-1 font-medium">{activity.taskTitle}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="table" className="mt-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Membro</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Tarefa</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">
                        {format(new Date(activity.completedAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{activity.memberName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" style={{ 
                          borderColor: activity.departmentId ? departments.find(d => d.id === activity.departmentId)?.cor || 'currentColor' : 'currentColor' 
                        }}>
                          {activity.departmentName}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.taskTitle}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {activity.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                          {activity.status === 'completed' ? 'Concluída' : 'Arquivada'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
}
