
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer, TeamMember } from '@/types';

interface CustomerBasicFieldsProps {
  cliente: Omit<Customer, 'id' | 'lastContact'>;
  setCliente: React.Dispatch<React.SetStateAction<Omit<Customer, 'id' | 'lastContact'>>>;
  teamMembers: TeamMember[];
}

export const CustomerBasicFields: React.FC<CustomerBasicFieldsProps> = ({
  cliente,
  setCliente,
  teamMembers,
}) => {
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Nome
        </Label>
        <Input
          id="name"
          value={cliente.name}
          onChange={(e) => setCliente({...cliente, name: e.target.value})}
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
          value={cliente.email}
          onChange={(e) => setCliente({...cliente, email: e.target.value})}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">
          Telefone
        </Label>
        <Input
          id="phone"
          value={cliente.phone}
          onChange={(e) => setCliente({...cliente, phone: e.target.value})}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select
          value={cliente.status}
          onValueChange={(value: 'lead' | 'prospect' | 'customer' | 'churned') => setCliente({...cliente, status: value})}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="customer">Cliente</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="value" className="text-right">
          Valor (R$)
        </Label>
        <Input
          id="value"
          type="number"
          value={cliente.value.toString()}
          onChange={(e) => setCliente({...cliente, value: parseFloat(e.target.value) || 0})}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="assignedTo" className="text-right">
          Responsável
        </Label>
        <Select
          value={cliente.assignedTo}
          onValueChange={(value) => setCliente({...cliente, assignedTo: value})}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione um responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem responsável</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="notes" className="text-right align-top pt-2">
          Notas
        </Label>
        <Textarea
          id="notes"
          value={cliente.notes}
          onChange={(e) => setCliente({...cliente, notes: e.target.value})}
          className="col-span-3"
          rows={3}
        />
      </div>
    </>
  );
};
