
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';

interface DepartmentFormProps {
  onSuccess?: () => void;
  initialData?: {
    id: string;
    nome: string;
    descricao: string;
    cor: string;
  };
  mode: 'create' | 'edit';
}

export function DepartmentForm({ onSuccess, initialData, mode }: DepartmentFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    cor: initialData?.cor || '#3b82f6'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleColorChange = (color: string) => {
    setFormData(prev => ({
      ...prev,
      cor: color
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do departamento é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      
      if (mode === 'create') {
        result = await supabase
          .from('departamentos')
          .insert([{
            nome: formData.nome,
            descricao: formData.descricao,
            cor: formData.cor
          }]);
      } else {
        result = await supabase
          .from('departamentos')
          .update({
            nome: formData.nome,
            descricao: formData.descricao,
            cor: formData.cor
          })
          .eq('id', initialData?.id);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Sucesso",
        description: mode === 'create' ? "Departamento criado com sucesso" : "Departamento atualizado com sucesso",
        variant: "default"
      });
      
      setOpen(false);
      if (onSuccess) onSuccess();
      
      // Reset form if it's create mode
      if (mode === 'create') {
        setFormData({
          nome: '',
          descricao: '',
          cor: '#3b82f6'
        });
      }
    } catch (error: any) {
      console.error('Erro ao salvar departamento:', error);
      toast({
        title: "Erro",
        description: `Não foi possível ${mode === 'create' ? 'criar' : 'atualizar'} o departamento: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Departamento
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Criar Novo Departamento' : 'Editar Departamento'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Preencha os dados para criar um novo departamento.' : 'Atualize as informações do departamento.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Ex: Marketing"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <Input
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Descrição do departamento (opcional)"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cor" className="text-right">
                Cor
              </Label>
              <div className="col-span-3">
                <ColorPicker 
                  color={formData.cor} 
                  onChange={handleColorChange} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Criar Departamento' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
