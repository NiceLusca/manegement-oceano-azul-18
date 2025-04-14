
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TeamMember } from '@/types';

interface CustomerFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  novoCliente: {
    name: string;
    origem: string;
    email: string;
    phone: string;
    status: string;
    notes: string;
    assignedTo: string;
    value: number;
  };
  setNovoCliente: React.Dispatch<React.SetStateAction<{
    name: string;
    origem: string;
    email: string;
    phone: string;
    status: string;
    notes: string;
    assignedTo: string;
    value: number;
  }>>;
  teamMembers: TeamMember[];
  handleAddCustomer: () => Promise<void>;
}

const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  open,
  setOpen,
  novoCliente,
  setNovoCliente,
  teamMembers,
  handleAddCustomer
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para adicionar um novo cliente ao sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input
              id="name"
              value={novoCliente.name}
              onChange={(e) => setNovoCliente({...novoCliente, name: e.target.value})}
              className="col-span-3"
              placeholder="Nome do cliente ou empresa"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origem" className="text-right">Origem</Label>
            <Input
              id="origem"
              value={novoCliente.origem}
              onChange={(e) => setNovoCliente({...novoCliente, origem: e.target.value})}
              className="col-span-3"
              placeholder="Como o cliente chegou até você"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input
              id="email"
              type="email"
              value={novoCliente.email}
              onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
              className="col-span-3"
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Telefone</Label>
            <Input
              id="phone"
              value={novoCliente.phone}
              onChange={(e) => setNovoCliente({...novoCliente, phone: e.target.value})}
              className="col-span-3"
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select
              value={novoCliente.status}
              onValueChange={(value) => setNovoCliente({...novoCliente, status: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospecto</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="churned">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              value={novoCliente.value.toString()}
              onChange={(e) => setNovoCliente({...novoCliente, value: parseFloat(e.target.value) || 0})}
              className="col-span-3"
              placeholder="0,00"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignedTo" className="text-right">Responsável</Label>
            <Select
              value={novoCliente.assignedTo}
              onValueChange={(value) => setNovoCliente({...novoCliente, assignedTo: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Atribuir a um membro da equipe" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">Observações</Label>
            <Textarea
              id="notes"
              value={novoCliente.notes}
              onChange={(e) => setNovoCliente({...novoCliente, notes: e.target.value})}
              className="col-span-3"
              rows={4}
              placeholder="Adicione informações relevantes sobre o cliente"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddCustomer}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormDialog;
