
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, FileDown, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface TeamActivity {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  details: string | null;
  entity_type: string;
  entity_id: string | null;
  user_name: string;
  user_avatar: string | null;
  department_name: string | null;
  department_color: string | null;
}

export function TeamActivityHistory() {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  
  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('team_activity_view')
          .select('*')
          .order('created_at', { ascending: false });
          
        // Apply filters
        if (entityFilter !== 'all') {
          query = query.eq('entity_type', entityFilter);
        }
        
        if (userFilter !== 'all') {
          query = query.eq('user_id', userFilter);
        }
        
        if (departmentFilter !== 'all') {
          query = query.eq('department_id', departmentFilter);
        }
        
        if (searchQuery) {
          query = query.or(`details.ilike.%${searchQuery}%,action.ilike.%${searchQuery}%`);
        }
        
        if (dateRange.from) {
          query = query.gte('created_at', dateRange.from.toISOString());
        }
        
        if (dateRange.to) {
          const nextDay = new Date(dateRange.to);
          nextDay.setDate(nextDay.getDate() + 1);
          query = query.lt('created_at', nextDay.toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [entityFilter, userFilter, departmentFilter, searchQuery, dateRange]);
  
  // Fetch users and departments for filters
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        // Fetch users
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, nome');
          
        if (userError) throw userError;
        setUsers(userData.map(u => ({ id: u.id, name: u.nome || 'Usuário sem nome' })) || []);
        
        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from('departamentos')
          .select('id, nome');
          
        if (deptError) throw deptError;
        setDepartments(deptData.map(d => ({ id: d.id, name: d.nome })) || []);
        
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    
    fetchFiltersData();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Hoje, ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Ontem, ${format(date, 'HH:mm')}`;
    } else {
      return format(date, "dd 'de' MMMM, HH:mm", { locale: ptBR });
    }
  };
  
  const getActionVerb = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'criou';
      case 'update':
        return 'atualizou';
      case 'delete':
        return 'removeu';
      case 'assign':
        return 'atribuiu';
      case 'complete':
        return 'completou';
      case 'comment':
        return 'comentou em';
      default:
        return action;
    }
  };
  
  const getEntityName = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'task':
        return 'tarefa';
      case 'project':
        return 'projeto';
      case 'user':
        return 'usuário';
      case 'department':
        return 'departamento';
      case 'customer':
        return 'cliente';
      default:
        return entityType;
    }
  };
  
  const exportToCSV = () => {
    if (activities.length === 0) return;
    
    // Create CSV content
    const headers = ['Data', 'Usuário', 'Departamento', 'Ação', 'Entidade', 'Detalhes'];
    const csvRows = [headers.join(',')];
    
    for (const activity of activities) {
      const row = [
        format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm:ss'),
        activity.user_name,
        activity.department_name || 'N/A',
        getActionVerb(activity.action),
        getEntityName(activity.entity_type),
        `"${activity.details?.replace(/"/g, '""') || ''}"`
      ];
      csvRows.push(row.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create link and trigger download
    const link = document.createElement('a');
    const fileName = `atividades_equipe_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, fileName);
    } else {
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Histórico de Atividades</CardTitle>
            <CardDescription>
              Acompanhe as ações realizadas por todos os membros da equipe
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2 bg-muted/20 rounded-md p-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no histórico..."
                className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4" />
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Tipo de entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas entidades</SelectItem>
                  <SelectItem value="task">Tarefas</SelectItem>
                  <SelectItem value="project">Projetos</SelectItem>
                  <SelectItem value="user">Usuários</SelectItem>
                  <SelectItem value="department">Departamentos</SelectItem>
                  <SelectItem value="customer">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    "Selecione as datas"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Mais filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filtros Avançados</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Usuário</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setUserFilter('all')}>
                  Todos os usuários
                  {userFilter === 'all' && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                {users.map(user => (
                  <DropdownMenuItem key={user.id} onClick={() => setUserFilter(user.id)}>
                    {user.name}
                    {userFilter === user.id && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Departamento</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDepartmentFilter('all')}>
                  Todos os departamentos
                  {departmentFilter === 'all' && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                {departments.map(dept => (
                  <DropdownMenuItem key={dept.id} onClick={() => setDepartmentFilter(dept.id)}>
                    {dept.name}
                    {departmentFilter === dept.id && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 items-center p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhuma atividade encontrada com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="font-medium">{formatDate(activity.created_at)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={activity.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user_name)}&background=random`} 
                            alt={activity.user_name} 
                          />
                          <AvatarFallback>
                            {activity.user_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{activity.user_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.department_name ? (
                        <Badge variant="outline" style={{
                          borderColor: activity.department_color || undefined,
                          color: activity.department_color || undefined
                        }}>
                          {activity.department_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant={
                          activity.action.toLowerCase() === 'create' ? 'default' :
                          activity.action.toLowerCase() === 'update' ? 'outline' :
                          activity.action.toLowerCase() === 'delete' ? 'destructive' :
                          'secondary'
                        }>
                          {getActionVerb(activity.action)} {getEntityName(activity.entity_type)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {activity.details || <span className="text-muted-foreground italic">Sem detalhes</span>}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Need to explicitly import the Check icon for the dropdown menu
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
