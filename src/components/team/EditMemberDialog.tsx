
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Department {
  id: string;
  nome: string;
}

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditMember: () => void;
  editMembro: {
    id: string;
    nome: string;
    cargo: string;
    departamento: string;
    avatar_url: string;
  };
  setEditMembro: React.Dispatch<React.SetStateAction<{
    id: string;
    nome: string;
    cargo: string;
    departamento: string;
    avatar_url: string;
  }>>;
  departamentos: Department[];
}

export const EditMemberDialog: React.FC<EditMemberDialogProps> = ({
  open,
  onOpenChange,
  onEditMember,
  editMembro,
  setEditMembro,
  departamentos
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
          <DialogDescription>
            Atualize os detalhes do membro selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-nome" className="text-right">
              Nome
            </Label>
            <Input
              id="edit-nome"
              value={editMembro.nome}
              onChange={(e) => setEditMembro({...editMembro, nome: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-cargo" className="text-right">
              Cargo
            </Label>
            <Input
              id="edit-cargo"
              value={editMembro.cargo}
              onChange={(e) => setEditMembro({...editMembro, cargo: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-departamento" className="text-right">
              Departamento
            </Label>
            <Select
              value={editMembro.departamento}
              onValueChange={(value) => setEditMembro({...editMembro, departamento: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um departamento" />
              </SelectTrigger>
              <SelectContent>
                {departamentos.map((dep) => (
                  <SelectItem key={dep.id} value={dep.id}>
                    {dep.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-avatar" className="text-right">
              URL do Avatar
            </Label>
            <Input
              id="edit-avatar"
              value={editMembro.avatar_url}
              onChange={(e) => setEditMembro({...editMembro, avatar_url: e.target.value})}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={onEditMember}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
