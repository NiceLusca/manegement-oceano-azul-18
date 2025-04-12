
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { tasks, getTeamMemberById } from '@/data/mock-data';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivity() {
  // Sort tasks by due date to show the most recent ones
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTasks.map((task) => {
            const assignee = getTeamMemberById(task.assigneeId);
            const dueDate = new Date(task.dueDate);
            
            return (
              <div key={task.id} className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={assignee?.avatar} />
                  <AvatarFallback>{assignee?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{assignee?.name} <span className="font-normal text-muted-foreground">is assigned to</span> {task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                  </p>
                </div>
                <div className={`ml-auto rounded-full px-2 py-1 text-xs ${
                  task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status === 'todo' ? 'To Do' :
                  task.status === 'in-progress' ? 'In Progress' :
                  task.status === 'review' ? 'In Review' :
                  'Completed'}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
