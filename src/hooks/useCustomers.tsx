
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Customer, TeamMember } from '@/types';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) throw error;
      
      const mappedCustomers: Customer[] = (data || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        origem: customer.origem || '',
        email: customer.email || '',
        phone: customer.phone || '',
        status: (customer.status || 'lead') as 'lead' | 'prospect' | 'customer' | 'churned',
        lastContact: customer.last_contact || '',
        notes: customer.notes || '',
        assignedTo: customer.assigned_to || '',
        value: customer.value || 0
      }));
      
      setCustomers(mappedCustomers);
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      
      const formattedMembers: TeamMember[] = (data || []).map(profile => ({
        id: profile.id,
        name: profile.nome || 'Sem nome',
        role: profile.cargo || 'Colaborador',
        email: '',  // O Supabase não armazena emails no perfil
        avatar: profile.avatar_url || '',
        department: profile.departamento_id || '',
        status: 'active', // Definindo como 'active' para corresponder ao tipo esperado
        joinedDate: profile.created_at
      }));
      
      setTeamMembers(formattedMembers);
    } catch (error: any) {
      console.error('Erro ao buscar equipe:', error.message);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'lastContact'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            name: customerData.name,
            origem: customerData.origem,
            email: customerData.email,
            phone: customerData.phone,
            status: customerData.status,
            notes: customerData.notes,
            assigned_to: customerData.assignedTo || null,
            value: customerData.value || 0
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!",
        variant: "default"
      });

      if (data && data.length > 0) {
        const newCustomer: Customer = {
          id: data[0].id,
          name: data[0].name,
          origem: data[0].origem || '',
          email: data[0].email || '',
          phone: data[0].phone || '',
          status: (data[0].status || 'lead') as 'lead' | 'prospect' | 'customer' | 'churned',
          lastContact: data[0].last_contact || '',
          notes: data[0].notes || '',
          assignedTo: data[0].assigned_to || '',
          value: data[0].value || 0
        };
        
        setCustomers(prev => [...prev, newCustomer]);
      }

      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar cliente:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cliente: " + error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchTeamMembers();
  }, []);

  return {
    customers,
    teamMembers,
    loading,
    addCustomer,
    refreshCustomers: fetchCustomers
  };
};
