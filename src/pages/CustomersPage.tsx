
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import CustomerSearch from '@/components/customers/CustomerSearch';
import CustomerTableView from '@/components/customers/CustomerTableView';
import { CustomerGridView } from '@/components/customers/CustomerGridView';
import CustomerFormDialog from '@/components/customers/CustomerFormDialog';
import CsvImportDialog from '@/components/customers/CsvImportDialog';
import { getStatusColor, translateStatus } from '@/components/customers/CustomerUtils';
import { Customer } from '@/types';

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [openDialog, setOpenDialog] = useState(false);
  const [openCsvDialog, setOpenCsvDialog] = useState(false);
  const [novoCliente, setNovoCliente] = useState<Omit<Customer, 'id' | 'lastContact'>>({
    name: '',
    origem: '',
    email: '',
    phone: '',
    status: 'lead',
    notes: '',
    assignedTo: '',
    value: 0
  });
  
  const { customers, teamMembers, loading, addCustomer, fetchCustomers } = useCustomers();

  const handleAddCustomer = async () => {
    if (!novoCliente.name.trim()) {
      return;
    }

    const success = await addCustomer(novoCliente);
    
    if (success) {
      setNovoCliente({
        name: '',
        origem: '',
        email: '',
        phone: '',
        status: 'lead',
        notes: '',
        assignedTo: '',
        value: 0
      });
      setOpenDialog(false);
    }
  };

  const handleImportSuccess = () => {
    fetchCustomers();
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.origem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus relacionamentos com clientes</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => setOpenCsvDialog(true)}
            >
              <Upload className="h-4 w-4" />
              Importar CSV
            </Button>
            
            <Button className="flex items-center gap-2" onClick={() => setOpenDialog(true)}>
              <Plus className="h-4 w-4" />
              Adicionar Cliente
            </Button>
          </div>
          
          <CustomerFormDialog
            open={openDialog}
            setOpen={setOpenDialog}
            novoCliente={novoCliente}
            setNovoCliente={setNovoCliente}
            teamMembers={teamMembers}
            handleAddCustomer={handleAddCustomer}
          />
          
          <CsvImportDialog
            open={openCsvDialog}
            setOpen={setOpenCsvDialog}
            onImportSuccess={handleImportSuccess}
          />
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <CustomerSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </CardContent>
        </Card>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando clientes...</p>
          </div>
        ) : viewMode === 'table' ? (
          <Card>
            <CardContent className="pt-6">
              <CustomerTableView 
                customers={filteredCustomers} 
                teamMembers={teamMembers}
                getStatusColor={getStatusColor}
                translateStatus={translateStatus}
              />
            </CardContent>
          </Card>
        ) : (
          <CustomerGridView
            customers={filteredCustomers}
            teamMembers={teamMembers}
            getStatusColor={getStatusColor}
            translateStatus={translateStatus}
          />
        )}
      </div>
    </Layout>
  );
};

export default CustomersPage;
