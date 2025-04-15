
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TeamMember } from '@/types';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { ProjectsList } from '@/components/projects/ProjectsList';
import { useProjects } from '@/hooks/useProjects';

const ProjectsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    status: 'todo',
    prioridade: 'medium',
    responsavel: '',
    departamento: '',
    dataVencimento: '',
    isRecurring: false,
    recurrenceType: 'daily',
    endDate: '',
    customDays: [],
    // Remove customMonths as it's not in the type definition
  });
  const [membrosFiltrados, setMembrosFiltrados] = useState<TeamMember[]>([]);
  
  const { 
    projects, 
    teamMembers, 
    departamentos, 
    loading, 
    addTask,
    addRecurringTask
  } = useProjects();

  useEffect(() => {
    if (novaTarefa.departamento) {
      const membrosDoDepto = teamMembers.filter(member => member.department === novaTarefa.departamento);
      setMembrosFiltrados(membrosDoDepto);
      if (novaTarefa.responsavel && !membrosDoDepto.some(m => m.id === novaTarefa.responsavel)) {
        setNovaTarefa({...novaTarefa, responsavel: ''});
      }
    } else {
      setMembrosFiltrados([]);
    }
  }, [novaTarefa.departamento, teamMembers]);

  const handleDepartmentChange = (departmentId: string) => {
    const membrosDoDepto = teamMembers.filter(member => member.department === departmentId);
    setMembrosFiltrados(membrosDoDepto);
  };

  const handleAddTask = async () => {
    let success = false;
    
    if (novaTarefa.isRecurring) {
      success = await addRecurringTask({
        title: novaTarefa.titulo,
        description: novaTarefa.descricao,
        assigneeId: novaTarefa.responsavel,
        startDate: novaTarefa.dataVencimento,
        endDate: novaTarefa.endDate,
        recurrenceType: novaTarefa.recurrenceType,
        customDays: novaTarefa.customDays,
        priority: novaTarefa.prioridade
        // customMonths removed from here
      });
    } else {
      success = await addTask(novaTarefa);
    }
    
    if (success) {
      setNovaTarefa({
        titulo: '',
        descricao: '',
        status: 'todo',
        prioridade: 'medium',
        responsavel: '',
        departamento: '',
        dataVencimento: '',
        isRecurring: false,
        recurrenceType: 'daily',
        endDate: '',
        customDays: [],
        // Remove customMonths here as well
      });
      setOpenDialog(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tarefas</h1>
            <p className="text-muted-foreground">Gerencie as tarefas da sua equipe.</p>
          </div>
          
          <ProjectFormDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            teamMembers={teamMembers}
            departamentos={departamentos}
            membrosFiltrados={membrosFiltrados}
            onDepartmentChange={handleDepartmentChange}
            onSubmit={handleAddTask}
            novaTarefa={novaTarefa}
            setNovaTarefa={setNovaTarefa}
          />
          
          <Button className="flex items-center gap-2" onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
        
        <KanbanBoard />
        
        <h2 className="text-xl font-bold mt-8">Visão Geral de Tarefas</h2>
        
        <ProjectsList 
          projects={projects}
          teamMembers={teamMembers}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default ProjectsPage;
