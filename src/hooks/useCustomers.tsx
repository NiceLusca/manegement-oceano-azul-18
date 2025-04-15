
import { useState, useEffect, useCallback } from 'react';
import { Customer, TeamMember } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [originOptions, setOriginOptions] = useState<string[]>(['Naie', '1k por Dia', 'Outro']);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');
      
      if (customersError) throw customersError;
      
      // Fetch team members for assignment
      const { data: teamData, error: teamError } = await supabase
        .from('profiles')
        .select('id, nome, cargo, avatar_url, nivel_acesso');
      
      if (teamError) throw teamError;
      
      // Fetch origin options
      const { data: originData, error: originError } = await supabase
        .from('customers')
        .select('origem_options')
        .limit(1);
        
      if (!originError && originData && originData.length > 0 && originData[0].origem_options) {
        setOriginOptions(originData[0].origem_options);
      }
      
      // Map the database fields to our TypeScript interface
      const mappedCustomers: Customer[] = (customersData || []).map(item => ({
        id: item.id,
        name: item.name,
        origem: item.origem || '',
        email: item.email || '',
        phone: item.phone || '',
        status: (item.status || 'lead') as 'lead' | 'prospect' | 'customer' | 'churned',
        lastContact: item.last_contact || '',
        notes: item.notes || '',
        assignedTo: item.assigned_to || '',
        value: item.value || 0
      }));
      
      setCustomers(mappedCustomers);
      
      // Map team members with correct accessLevel type
      const mappedTeamMembers: TeamMember[] = (teamData || []).map(member => {
        // Ensure accessLevel is one of the allowed values
        let accessLevel: 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user' = 'user';
        if (member.nivel_acesso === 'SuperAdmin' || 
            member.nivel_acesso === 'Admin' || 
            member.nivel_acesso === 'Supervisor') {
          accessLevel = member.nivel_acesso;
        }
        
        return {
          id: member.id,
          name: member.nome || 'Sem nome',
          role: member.cargo || 'Colaborador',
          email: '',
          avatar: member.avatar_url || '',
          department: '',
          status: 'active',
          joinedDate: '',
          accessLevel
        };
      });
      
      setTeamMembers(mappedTeamMembers);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
            assigned_to: customerData.assignedTo,
            value: customerData.value,
            last_contact: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Map the returned data to our Customer type
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
        
        // Update the customer list with the new customer
        setCustomers(prev => [...prev, newCustomer]);
      }
      
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!",
        variant: "default"
      });
      
      // If customer has a custom origin, update the origin options
      if (customerData.origem && 
          !originOptions.includes(customerData.origem) && 
          customerData.origem !== 'Outro') {
        
        const newOriginOptions = [...originOptions];
        // Keep "Outro" at the end
        newOriginOptions.pop();
        newOriginOptions.push(customerData.origem);
        newOriginOptions.push('Outro');
        
        // Update the origin options in the database
        await supabase
          .from('customers')
          .update({ origem_options: newOriginOptions })
          .eq('id', data[0].id);
          
        setOriginOptions(newOriginOptions);
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

  const updateCustomer = async (customerData: Customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          origem: customerData.origem,
          email: customerData.email,
          phone: customerData.phone,
          status: customerData.status,
          notes: customerData.notes,
          assigned_to: customerData.assignedTo,
          value: customerData.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerData.id);

      if (error) throw error;

      // Update the customer list
      setCustomers(prev => prev.map(customer => 
        customer.id === customerData.id ? customerData : customer
      ));
      
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
        variant: "default"
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente: " + error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      // Update the customer list
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
      
      toast({
        title: "Sucesso",
        description: "Cliente removido com sucesso!",
        variant: "default"
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente: " + error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    customers,
    teamMembers,
    loading,
    originOptions,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
};
