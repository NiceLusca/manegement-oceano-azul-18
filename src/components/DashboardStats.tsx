
import React, { useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle, ClockIcon } from 'lucide-react';
import { getTasksByStatus, teamMembers, getTasksByDepartment, getTasksByAssignee } from '@/data/mock-data';
import { startOfMonth, endOfMonth, isBefore, isAfter, format } from 'date-fns';
import { projects } from '@/data/mock-data';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { DepartmentFilter } from '@/components/dashboard/DepartmentFilter';
import { AccessLevelSelector } from '@/components/dashboard/AccessLevelSelector';
import { StatCard } from '@/components/dashboard/StatCard';
import { DepartmentProgressSection } from '@/components/dashboard/DepartmentProgressSection';
import { PerformanceIndicators } from '@/components/dashboard/PerformanceIndicators';
import { WorkloadDistribution } from '@/components/dashboard/WorkloadDistribution';

// Constants
const departments = ["Desenvolvimento", "Design", "Marketing", "Vendas", "Suporte"];
const departmentColors = ["bg-blue-500", "bg-pink-500", "bg-green-500", "bg-orange-500", "bg-purple-500"];

export function DashboardStats() {
  // State
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [startDateInput, setStartDateInput] = useState<string>(format(startOfMonth(new Date()), 'dd/MM/yyyy'));
  const [endDateInput, setEndDateInput] = useState<string>(format(endOfMonth(new Date()), 'dd/MM/yyyy'));
  const [nivelAcesso, setNivelAcesso] = useState("admin");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  
  // Parse date input
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
  
  // Effect for handling date input changes
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
  
  // Filter tasks based on date range
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
  
  // Prepare stats
  const activeTeamMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(project => project.status === 'in-progress').length;
  
  // Prepare department stats
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
  
  // Access level checks
  const isAdmin = nivelAcesso === "admin";
  const isManager = nivelAcesso === "admin" || nivelAcesso === "manager";
  const filteredDepartmentStats = departmentFilter 
    ? departmentStats.filter(dept => dept.department === departmentFilter) 
    : departmentStats;
  
  return (
    <div className="space-y-6 bg-gray-950">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex flex-wrap gap-4 items-center">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            startDateInput={startDateInput}
            endDateInput={endDateInput}
            setStartDateInput={setStartDateInput}
            setEndDateInput={setEndDateInput}
          />
          
          <DepartmentFilter
            departments={departments}
            selectedDepartment={departmentFilter}
            onDepartmentChange={setDepartmentFilter}
          />
        </div>
        
        {isAdmin && (
          <AccessLevelSelector 
            accessLevel={nivelAcesso} 
            onAccessLevelChange={setNivelAcesso} 
          />
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
          <DepartmentProgressSection departmentStats={filteredDepartmentStats} />
          
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PerformanceIndicators />
              <WorkloadDistribution 
                teamMembers={teamMembers}
                getTasksByAssignee={getTasksByAssignee}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
