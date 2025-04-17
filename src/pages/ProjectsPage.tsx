import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TeamMember } from '@/types';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { ProjectsList } from '@/components/projects/ProjectsList';
import { useNavigate, useLocation } from 'react-router-dom';

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
    dataHora: '',
    isRecurring: false,
    recurrenceType: 'daily',
    endDate: '',
    customDays: [],
  });
  const [membrosFiltrados, setMembrosFiltrados] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState("kanban");
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname === '/projects') {
      setActiveTab('kanban');
    } else if (location.pathname === '/recurring-tasks') {
      setActiveTab('recurring');
    } else if (location.pathname === '/activity-history') {
      setActiveTab('history');
    }
  }, [location.pathname]);

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
    
    let dataCompleta = novaTarefa.dataVencimento;
    if (novaTarefa.dataVencimento && novaTarefa.dataHora) {
      const data = new Date(novaTarefa.dataVencimento);
      const [horas, minutos] = novaTarefa.dataHora.split(':').map(Number);
      data.setHours(horas || 0, minutos || 0);
      dataCompleta = data.toISOString();
    }
    
    if (novaTarefa.isRecurring) {
      success = await addRecurringTask({
        title: novaTarefa.titulo,
        description: novaTarefa.descricao,
        assigneeId: novaTarefa.responsavel,
        startDate: dataCompleta,
        endDate: novaTarefa.endDate,
        recurrenceType: novaTarefa.recurrenceType,
        customDays: novaTarefa.customDays,
        priority: novaTarefa.prioridade
      });
    } else {
      success = await addTask({
        ...novaTarefa,
        dataVencimento: dataCompleta
      });
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
        dataHora: '',
        isRecurring: false,
        recurrenceType: 'daily',
        endDate: '',
        customDays: [],
      });
      setOpenDialog(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    if (value === 'kanban') {
      navigate('/projects');
    } else if (value === 'recurring') {
      navigate('/recurring-tasks');
    } else if (value === 'history') {
      navigate('/activity-history');
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
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full bg-[#1e2131]/50 p-1">
            <TabsTrigger 
              value="kanban" 
              className="flex-1 data-[state=active]:bg-[#1e2131] data-[state=active]:text-[#38a9e4]"
            >
              Quadro Kanban
            </TabsTrigger>
            <TabsTrigger 
              value="recurring" 
              className="flex-1 data-[state=active]:bg-[#1e2131] data-[state=active]:text-[#38a9e4]"
            >
              Tarefas Recorrentes
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex-1 data-[state=active]:bg-[#1e2131] data-[state=active]:text-[#38a9e4]"
            >
              Histórico de Atividades
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "kanban" && (
            <TabsContent value="kanban" className="pt-4">
              <KanbanBoard />
              
              <h2 className="text-xl font-bold mt-8">Visão Geral de Tarefas</h2>
              
              <ProjectsList 
                projects={projects}
                teamMembers={teamMembers}
                loading={loading}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
