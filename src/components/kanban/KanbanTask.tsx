
import React, { useState } from 'react';
import { Task } from '@/types';
import { getTeamMemberById, projects } from '@/data/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarClock, MessageSquare, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface KanbanTaskProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

export const KanbanTask: React.FC<KanbanTaskProps> = ({ task, onDragStart }) => {
  const assignee = getTeamMemberById(task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);
  const [showDetails, setShowDetails] = useState(false);
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  
  const handleFileUpload = () => {
    // Criar um input para selecionar arquivos
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx';
    fileInput.multiple = false;
    
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        // Aqui você pode implementar a lógica para enviar o arquivo para o servidor
        // Por enquanto, apenas exibir uma notificação
        toast({
          title: "Arquivo anexado",
          description: `${file.name} foi anexado à tarefa "${task.title}"`,
        });
      }
    };
    
    fileInput.click();
  };
  
  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    // Aqui você pode implementar a lógica para salvar o comentário no servidor
    // Por enquanto, apenas exibir uma notificação
    toast({
      title: "Comentário adicionado",
      description: `Seu comentário foi adicionado à tarefa "${task.title}"`,
    });
    
    setComment('');
  };
  
  return (
    <Card 
      key={task.id} 
      className="hover-scale shadow-sm cursor-move" 
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm mb-1">{task.title}</h3>
          <div className="flex gap-1">
            {task.isRecurring && (
              <Badge variant="outline" className="bg-[#D0E9FF] text-[#005B99] border-[#D0E9FF]/70 flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex justify-between items-center text-xs">
          <Badge variant="outline" className="text-xs font-normal">
            {project?.name || "Sem categoria"}
          </Badge>
          <Badge 
            variant={
              task.priority === 'low' ? 'outline' :
              task.priority === 'medium' ? 'secondary' :
              'destructive'
            }
            className="text-xs"
          >
            {task.priority === 'low' ? 'Baixa' : 
             task.priority === 'medium' ? 'Média' : 'Alta'}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </div>
          {assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback>{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
        </div>
        
        {showDetails && (
          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-2 justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                    <MessageSquare className="h-3 w-3" />
                    Comentários
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Adicionar comentário</h4>
                    <Textarea 
                      placeholder="Escreva seu comentário..." 
                      className="min-h-[80px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleAddComment}>Enviar</Button>
                    </div>
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium mb-2">Comentários anteriores</h4>
                      <div className="text-xs text-muted-foreground italic">
                        Nenhum comentário ainda.
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs"
                onClick={handleFileUpload}
              >
                <FileText className="h-3 w-3" />
                Anexar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
