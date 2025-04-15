
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';

export const fetchCustomersData = async () => {
  const { data: customersData, error: customersError } = await supabase
    .from('customers')
    .select('*');
  
  if (customersError) throw customersError;
  
  return customersData || [];
};

export const fetchTeamData = async () => {
  const { data: teamData, error: teamError } = await supabase
    .from('profiles')
    .select('id, nome, cargo, avatar_url, nivel_acesso');
  
  if (teamError) throw teamError;
  
  return teamData || [];
};

export const fetchOriginOptions = async () => {
  const { data: originData, error: originError } = await supabase
    .from('customers')
    .select('origem_options')
    .limit(1);
    
  if (originError) throw originError;
  
  if (originData && originData.length > 0 && originData[0].origem_options) {
    return originData[0].origem_options;
  }
  
  return ['Naie', '1k por Dia', 'Outro'];
};

export const addNewCustomer = async (customerData: Omit<Customer, 'id' | 'lastContact'>) => {
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
  return data;
};

export const updateCustomerData = async (customerData: Customer) => {
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
  return true;
};

export const deleteCustomerData = async (customerId: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (error) throw error;
  return true;
};

export const updateOriginOptions = async (id: string, newOriginOptions: string[]) => {
  const { error } = await supabase
    .from('customers')
    .update({ origem_options: newOriginOptions })
    .eq('id', id);
    
  if (error) throw error;
  return true;
};
