
import React from 'react';
import { Mail, Phone, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer, TeamMember } from '@/types';

interface CustomerGridViewProps {
  customers: Customer[];
  teamMembers: TeamMember[];
  getStatusColor: (status: string) => string;
  translateStatus: (status: string) => string;
}

const CustomerGridView: React.FC<CustomerGridViewProps> = ({ customers, teamMembers, getStatusColor, translateStatus }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer) => {
        const assignedTeamMember = teamMembers.find(member => member.id === customer.assignedTo);
        const statusColor = getStatusColor(customer.status);
        
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
              <p className="text-muted-foreground mb-2">{customer.origem || 'Origem não informada'}</p>
              
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Email não informado</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Telefone não informado</span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Último Contato</span>
                  <span className="text-sm">
                    {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : 'Não registrado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Valor</span>
                  <span className="text-sm font-semibold">
                    {typeof customer.value === 'number' ? `R$ ${customer.value.toLocaleString()}` : 'R$ 0,00'}
                  </span>
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
  );
};

export default CustomerGridView;
