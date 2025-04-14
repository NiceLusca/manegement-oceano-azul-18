
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Mail, Phone, FileEdit } from 'lucide-react';
import { customers, teamMembers } from '@/data/mock-data';

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tradução dos status de clientes
  const translateStatus = (status: string) => {
    switch (status) {
      case 'lead': return 'lead';
      case 'prospect': return 'prospecto';
      case 'customer': return 'cliente';
      case 'churned': return 'perdido';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus relacionamentos com clientes</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => {
            const assignedTeamMember = teamMembers.find(member => member.id === customer.assignedTo);
            const statusColor = 
              customer.status === 'lead' ? 'bg-yellow-100 text-yellow-800' :
              customer.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
              customer.status === 'customer' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800';
            
            return (
              <Card key={customer.id} className="hover-scale">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{customer.name}</CardTitle>
                    <Badge variant="outline" className={statusColor}>
                      {translateStatus(customer.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{customer.company}</p>
                  
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                        {customer.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Último Contato</span>
                      <span className="text-sm">{new Date(customer.lastContact).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Valor</span>
                      <span className="text-sm font-semibold">R$ {customer.value.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {assignedTeamMember && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={assignedTeamMember.avatar} />
                          <AvatarFallback>{assignedTeamMember.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Responsável</p>
                          <p className="text-xs text-muted-foreground">{assignedTeamMember.name}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default CustomersPage;
