
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, CheckCircle, ClockIcon, BarChart, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { getTasksByStatus, teamMembers, projects, getTasksByAssignee, getTasksByProject, getTasksByDepartment } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  
  const [nivelAcesso, setNivelAcesso] = useState("admin");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  
  // Filtra tarefas com base na data selecionada
  const filteredTaskStats = getTasksByStatus(task => {
    const taskDate = new Date(task.dueDate);
    if (dateRange.from && dateRange.to) {
      return !isBefore(taskDate, dateRange.from) && !isAfter(taskDate, dateRange.to);
    }
    if (dateRange.from) {
      return !isBefore(taskDate, dateRange.from);
    }
    if (dateRange.to) {
      return !isAfter(taskDate, dateRange.to);
    }
    return true;
  });
  
  const activeTeamMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(project => project.status === 'in-progress').length;
  
  // Calcular progresso por departamento
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
  
  // Apenas administradores podem ver certas informações
  const isAdmin = nivelAcesso === "admin";
  const isManager = nivelAcesso === "admin" || nivelAcesso === "manager";
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        {/* Filtro por data */}
        <div className="flex flex-wrap gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      De {format(dateRange.from, "P", { locale: ptBR })} até{" "}
                      {format(dateRange.to, "P", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "P", { locale: ptBR })
                  )
                ) : (
                  "Selecionar período"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {/* Filtro por departamento */}
          <Select
            value={departmentFilter || ""}
            onValueChange={(value) => setDepartmentFilter(value === "" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os departamentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os departamentos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Seletor de nível de acesso (apenas para demonstração) */}
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
              {departmentStats
                .filter(dept => !departmentFilter || dept.department === departmentFilter)
                .map((dept) => (
                  <DepartmentProgress
                    key={dept.department}
                    department={dept.department}
                    tasksCompleted={dept.tasksCompleted}
                    tasksTotal={dept.tasksTotal}
                    color={dept.color}
                  />
                ))}
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
                      const maxWorkload = 10; // valor hipotético para o exemplo
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

function CalendarIcon({ className, ...props }: React.ComponentProps<typeof Clock>) {
  return (
    <Clock className={cn(className)} {...props} />
  );
}

function Clock({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-calendar", className)}
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
