
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projects, teamMembers } from '@/data/mock-data';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, CheckSquare } from 'lucide-react';

const ProjectsPage = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage your team's projects.</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => {
            const projectMembers = project.teamMembers.map(memberId => 
              teamMembers.find(member => member.id === memberId)
            ).filter(Boolean);
            
            return (
              <Card key={project.id} className="hover-scale">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{project.name}</CardTitle>
                    <Badge 
                      variant={
                        project.status === 'planning' ? 'outline' :
                        project.status === 'in-progress' ? 'default' :
                        project.status === 'review' ? 'secondary' :
                        'default'
                      }
                    >
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Progress</span>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2 mb-6" />
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CheckSquare className="h-4 w-4" />
                      <span>{project.tasks.length} tasks</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{project.teamMembers.length} members</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex -space-x-2">
                      {projectMembers.slice(0, 3).map((member, index) => (
                        <Avatar key={index} className="border-2 border-background h-8 w-8">
                          <AvatarImage src={member?.avatar} />
                          <AvatarFallback>{member?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ))}
                      {projectMembers.length > 3 && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground text-xs border-2 border-background">
                          +{projectMembers.length - 3}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
