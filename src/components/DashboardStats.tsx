import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, CheckCircle, ClockIcon, BarChart, Target, TrendingUp, AlertTriangle, Calendar, CalendarIcon as LucideCalendarIcon } from 'lucide-react';
import { getTasksByStatus, teamMembers, projects, getTasksByAssignee, getTasksByProject, getTasksByDepartment } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, isAfter, isBefore, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, description, icon, iconBg }: StatCardProps) {
  return (
    <Card className="hover-scale">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-full", iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface DepartmentProgressProps {
  department: string;
  tasksCompleted: number;
  tasksTotal: number;
  color: string;
}

function DepartmentProgress({ department, tasksCompleted, tasksTotal, color }: DepartmentProgressProps) {
  const progress = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{department}</span>
        <span className="text-sm text-muted-foreground">{tasksCompleted}/{tasksTotal}</span>
      </div>
      <Progress value={progress} className="h-2" indicatorClassName={color} />
    </div>
  );
}

const departments = ["Desenvolvimento", "Design", "Marketing", "Vendas", "Suporte"];
const departmentColors = ["bg-blue-500", "bg-pink-500", "bg-green-500", "bg-orange-500", "bg-purple-500"];

export function DashboardStats() {
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [startDateInput, setStartDateInput] = useState<string>(format(startOfMonth(new Date()), 'dd/MM/yyyy'));
  const [endDateInput, setEndDateInput] = useState<string>(format(endOfMonth(new Date()), 'dd/MM/yyyy'));
  
  const [nivelAcesso, setNivelAcesso] = useState("admin");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  
  const parseDateInput = (dateString: string): Date | undefined => {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month, day);
        return date;
      }
    }
    return undefined;
  };
  
  useEffect(() => {
    const parsedDate = parseDateInput(startDateInput);
    if (parsedDate) {
      setStartDate(parsedDate);
    }
  }, [startDateInput]);
  
  useEffect(() => {
    const parsedDate = parseDateInput(endDateInput);
    if (parsedDate) {
      setEndDate(parsedDate);
    }
  }, [endDateInput]);
  
  useEffect(() => {
    if (startDate) {
      setStartDateInput(format(startDate, 'dd/MM/yyyy'));
    }
  }, [startDate]);
  
  useEffect(() => {
    if (endDate) {
      setEndDateInput(format(endDate, 'dd/MM/yyyy'));
    }
  }, [endDate]);
  
  const filteredTaskStats = getTasksByStatus(task => {
    const taskDate = new Date(task.dueDate);
    if (startDate && endDate) {
      return !isBefore(taskDate, startDate) && !isAfter(taskDate, endDate);
    }
    if (startDate) {
      return !isBefore(taskDate, startDate);
    }
    if (endDate) {
      return !isAfter(taskDate, endDate);
    }
    return true;
  });
  
  const activeTeamMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(project => project.status === 'in-progress').length;
  
  const departmentStats = departments.map((dept, index) => {
    const departmentTasks = getTasksByDepartment(dept);
    const completedTasks = departmentTasks.filter(task => task.status === 'completed').length;
    
    return {
      department: dept,
      tasksCompleted: completedTasks,
      tasksTotal: departmentTasks.length,
      color: departmentColors[index % departmentColors.length]
    };
  });
  
  const isAdmin = nivelAcesso === "admin";
  const isManager = nivelAcesso === "admin" || nivelAcesso === "manager";
  
  const filteredDepartmentStats = departmentFilter 
    ? departmentStats.filter(dept => dept.department === departmentFilter)
    : departmentStats;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data inicial</Label>
              <div className="flex">
                <Input
                  id="start-date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-[150px]"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="ml-2">
                      <LucideCalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={ptBR}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">Data final</Label>
              <div className="flex">
                <Input
                  id="end-date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-[150px]"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="ml-2">
                      <LucideCalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={ptBR}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <Select
            value={departmentFilter || "all"}
            onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os departamentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os departamentos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isAdmin && (
          <Select value={nivelAcesso} onValueChange={setNivelAcesso}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Nível de acesso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Membros da Equipe"
          value={activeTeamMembers}
          description={`${teamMembers.length} membros no total`}
          icon={<Users className="h-4 w-4 text-white" />}
          iconBg="bg-blue-500"
        />
        <StatCard
          title="Projetos"
          value={totalProjects}
          description={`${inProgressProjects} em progresso`}
          icon={<Briefcase className="h-4 w-4 text-white" />}
          iconBg="bg-green-500"
        />
        <StatCard
          title="Tarefas Concluídas"
          value={filteredTaskStats.completed}
          description={`${filteredTaskStats.completed + filteredTaskStats.todo + filteredTaskStats.inProgress + filteredTaskStats.review} tarefas no total`}
          icon={<CheckCircle className="h-4 w-4 text-white" />}
          iconBg="bg-purple-500"
        />
        <StatCard
          title="Em Progresso"
          value={filteredTaskStats.inProgress + filteredTaskStats.review}
          description="Tarefas atualmente em andamento"
          icon={<ClockIcon className="h-4 w-4 text-white" />}
          iconBg="bg-orange-500"
        />
      </div>
      
      {isManager && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Progresso por Departamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredDepartmentStats.map((dept) => (
                <DepartmentProgress
                  key={dept.department}
                  department={dept.department}
                  tasksCompleted={dept.tasksCompleted}
                  tasksTotal={dept.tasksTotal}
                  color={dept.color}
                />
              ))}
              {filteredDepartmentStats.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum departamento encontrado.
                </div>
              )}
            </CardContent>
          </Card>
          
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Indicadores de Desempenho</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      <span>Produtividade da Equipe</span>
                    </div>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-500" />
                      <span>Metas Atingidas</span>
                    </div>
                    <span className="font-bold">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      <span>Tarefas em Atraso</span>
                    </div>
                    <span className="font-bold">5</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Carga de Trabalho</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers
                    .filter(member => member.status === 'active')
                    .slice(0, 5)
                    .map(member => {
                      const tasks = getTasksByAssignee(member.id);
                      const workload = tasks.length;
                      const maxWorkload = 10;
                      const percentage = Math.min(Math.round((workload / maxWorkload) * 100), 100);
                      
                      return (
                        <div key={member.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{member.name}</span>
                            <span className="text-sm text-muted-foreground">{workload} tarefas</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
