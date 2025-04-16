
import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer, TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomerFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  novoCliente: Omit<Customer, 'id' | 'lastContact'>;
  setNovoCliente: React.Dispatch<React.SetStateAction<Omit<Customer, 'id' | 'lastContact'>>>;
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
  const [customOrigin, setCustomOrigin] = useState('');
  const [originOptions, setOriginOptions] = useState<string[]>(['Naie', '1k por Dia', 'Outro']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      const fetchOriginOptions = async () => {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('origem_options')
            .limit(1)
            .single();
          
          if (error) {
            console.log('Erro ao buscar opções, usando valores padrão:', error);
            return;
          }
          
          if (data && data.origem_options && Array.isArray(data.origem_options)) {
            setOriginOptions(data.origem_options);
          }
        } catch (error) {
          console.error('Erro ao buscar opções de origem:', error);
        }
      };
      
      fetchOriginOptions();
    }
  }, [open]);
  
  const handleOrigemChange = (value: string) => {
    if (value === 'Outro') {
      setNovoCliente({...novoCliente, origem: ''});
    } else {
      setNovoCliente({...novoCliente, origem: value});
    }
  };
  
  const handleCustomOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomOrigin(e.target.value);
    setNovoCliente({...novoCliente, origem: e.target.value});
  };
  
  const handleSubmit = async () => {
    if (!novoCliente.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await handleAddCustomer();
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!",
        variant: "default"
      });
      setOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar cliente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Cliente</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do novo cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={novoCliente.name}
              onChange={(e) => setNovoCliente({...novoCliente, name: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origem" className="text-right">
              Origem
            </Label>
            <Select
              value={originOptions.includes(novoCliente.origem) ? novoCliente.origem : 'Outro'}
              onValueChange={handleOrigemChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                {originOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(!originOptions.includes(novoCliente.origem) || novoCliente.origem === '') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customOrigem" className="text-right">
                Outra Origem
              </Label>
              <Input
                id="customOrigem"
                value={customOrigin}
                onChange={handleCustomOriginChange}
                className="col-span-3"
                placeholder="Especifique a origem"
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={novoCliente.email}
              onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telefone
            </Label>
            <Input
              id="phone"
              value={novoCliente.phone}
              onChange={(e) => setNovoCliente({...novoCliente, phone: e.target.value})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={novoCliente.status}
              onValueChange={(value: 'lead' | 'prospect' | 'customer' | 'churned') => setNovoCliente({...novoCliente, status: value})}
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
              value={novoCliente.value.toString()}
              onChange={(e) => setNovoCliente({...novoCliente, value: parseFloat(e.target.value) || 0})}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignedTo" className="text-right">
              Responsável
            </Label>
            <Select
              value={novoCliente.assignedTo}
              onValueChange={(value) => setNovoCliente({...novoCliente, assignedTo: value})}
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
              value={novoCliente.notes}
              onChange={(e) => setNovoCliente({...novoCliente, notes: e.target.value})}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormDialog;
