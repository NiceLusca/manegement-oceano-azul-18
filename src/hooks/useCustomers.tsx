import { useState, useEffect, useCallback } from 'react';
import { Customer, TeamMember } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchCustomersData, 
  fetchTeamData, 
  fetchOriginOptions,
  addNewCustomer,
  updateCustomerData,
  deleteCustomerData,
  updateOriginOptions
} from '@/services/customerService';
import { mapCustomerFromDB, mapTeamMemberFromDB } from '@/utils/customerMappers';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [originOptions, setOriginOptions] = useState<string[]>(['Naie', '1k por Dia', 'Outro']);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all required data
      const customersData = await fetchCustomersData();
      const teamData = await fetchTeamData();
      const origins = await fetchOriginOptions();
      
      // Set origin options if retrieved
      setOriginOptions(origins);
      
      // Map the database fields to our TypeScript interfaces
      const mappedCustomers = customersData.map(mapCustomerFromDB);
      const mappedTeamMembers = teamData.map(mapTeamMemberFromDB);
      
      setCustomers(mappedCustomers);
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
      const data = await addNewCustomer(customerData);

      if (data && data.length > 0) {
        // Map the returned data to our Customer type
        const newCustomer = mapCustomerFromDB(data[0]);
        
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
        
        // Update the origin options in the database if we have an ID
        if (data && data.length > 0) {
          await updateOriginOptions(data[0].id, newOriginOptions);
        }
          
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
      await updateCustomerData(customerData);

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
      await deleteCustomerData(customerId);

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
