
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerBasicFields } from './CustomerBasicFields';
import { CustomerOriginField } from './CustomerOriginField';
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

  useEffect(() => {
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
          <CustomerOriginField 
            origem={novoCliente.origem}
            originOptions={originOptions}
            customOrigin={customOrigin}
            handleOrigemChange={handleOrigemChange}
            handleCustomOriginChange={handleCustomOriginChange}
          />
          
          <CustomerBasicFields 
            cliente={novoCliente}
            setCliente={setNovoCliente}
            teamMembers={teamMembers}
          />
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
