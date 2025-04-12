
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects } from '@/data/mock-data';
import { Progress } from '@/components/ui/progress';
import { formatDistance } from 'date-fns';

export function ProjectsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project) => {
            const now = new Date();
            const deadline = new Date(project.deadline);
            const timeRemaining = formatDistance(deadline, now, { addSuffix: false });
            
            return (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{project.name}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    project.status === 'planning' ? 'bg-gray-100 text-gray-800' :
                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>{project.progress}% complete</span>
                  <span>Due in {timeRemaining}</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
