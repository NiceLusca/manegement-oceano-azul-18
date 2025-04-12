
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, CheckCircle, ClockIcon } from 'lucide-react';
import { getTasksByStatus, teamMembers, projects } from '@/data/mock-data';
import { cn } from '@/lib/utils';

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

export function DashboardStats() {
  const taskStats = getTasksByStatus();
  const activeTeamMembers = teamMembers.filter(member => member.status === 'active').length;
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(project => project.status === 'in-progress').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Team Members"
        value={activeTeamMembers}
        description={`${teamMembers.length} total members`}
        icon={<Users className="h-4 w-4 text-white" />}
        iconBg="bg-blue-500"
      />
      <StatCard
        title="Projects"
        value={totalProjects}
        description={`${inProgressProjects} in progress`}
        icon={<Briefcase className="h-4 w-4 text-white" />}
        iconBg="bg-green-500"
      />
      <StatCard
        title="Completed Tasks"
        value={taskStats.completed}
        description={`${taskStats.completed + taskStats.todo + taskStats.inProgress + taskStats.review} total tasks`}
        icon={<CheckCircle className="h-4 w-4 text-white" />}
        iconBg="bg-purple-500"
      />
      <StatCard
        title="In Progress"
        value={taskStats.inProgress + taskStats.review}
        description="Tasks currently being worked on"
        icon={<ClockIcon className="h-4 w-4 text-white" />}
        iconBg="bg-orange-500"
      />
    </div>
  );
}
