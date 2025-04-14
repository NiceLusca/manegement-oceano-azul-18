
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamentos: Array<{ id: string; nome: string }>;
}

export const AddTeamMemberDialog: React.FC<AddTeamMemberDialogProps> = ({
  open,
  onOpenChange,
  departamentos
}) => {
  const [novoMembro, setNovoMembro] = React.useState({
    nome: '',
    cargo: '',
    departamento: '',
    email: ''
  });
  const { toast } = useToast();

  const handleAddMember = () => {
    // Em uma aplicação real, aqui seria feita a chamada à API para adicionar o membro
    if (!novoMembro.nome.trim() || !novoMembro.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Novo membro adicionado com sucesso!",
      variant: "default"
    });

    // Limpa os campos e fecha o diálogo
    setNovoMembro({
      nome: '',
      cargo: '',
      departamento: '',
      email: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Membro</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para adicionar um novo membro à equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <Input
              id="nome"
              value={novoMembro.nome}
              onChange={(e) => setNovoMembro({...novoMembro, nome: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={novoMembro.email}
              onChange={(e) => setNovoMembro({...novoMembro, email: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cargo" className="text-right">
              Cargo
            </Label>
            <Input
              id="cargo"
              value={novoMembro.cargo}
              onChange={(e) => setNovoMembro({...novoMembro, cargo: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departamento" className="text-right">
              Departamento
            </Label>
            <Select
              value={novoMembro.departamento}
              onValueChange={(value) => setNovoMembro({...novoMembro, departamento: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um departamento" />
              </SelectTrigger>
              <SelectContent>
                {departamentos.map((dep) => (
                  <SelectItem key={dep.id} value={dep.nome}>
                    {dep.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleAddMember}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
