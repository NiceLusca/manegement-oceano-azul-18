
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber, getCustomerStatusColor } from './CustomerUtils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Mail, Phone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerGridViewProps {
  customers: any[];
  onEdit: (customer: any) => void;
  onDelete: (customerId: string) => void;
}

export const CustomerGridView: React.FC<CustomerGridViewProps> = ({
  customers,
  onEdit,
  onDelete
}) => {
  // Return customer initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Format the last contact date
  const formatLastContact = (date: string) => {
    if (!date) return 'Sem contato recente';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {customers.map(customer => (
        <Card key={customer.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                {customer.avatar_url ? (
                  <AvatarImage src={customer.avatar_url} alt={customer.name} />
                ) : null}
                <AvatarFallback className="text-lg font-medium">
                  {getInitials(customer.name || 'Cliente')}
                </AvatarFallback>
              </Avatar>

              <h3 className="font-semibold text-xl">{customer.name || 'Cliente sem nome'}</h3>
              
              {customer.origem && (
                <p className="text-sm text-muted-foreground">
                  Origem: {customer.origem}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Badge variant={getCustomerStatusColor(customer.status)}>
                  {customer.status === 'lead' ? 'Lead' : 
                   customer.status === 'prospect' ? 'Prospecto' : 
                   customer.status === 'customer' ? 'Cliente' : 'Lead'}
                </Badge>
                {customer.value > 0 && (
                  <Badge variant="outline">
                    R$ {customer.value.toLocaleString('pt-BR')}
                  </Badge>
                )}
              </div>

              <div className="w-full mt-4 pt-4 border-t">
                {customer.email && (
                  <p className="flex items-center justify-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
                  </p>
                )}
                
                {customer.phone && (
                  <p className="flex items-center justify-center gap-2 text-sm mt-1">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${customer.phone}`} className="hover:underline">{formatPhoneNumber(customer.phone)}</a>
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Último contato: {formatLastContact(customer.last_contact)}
                </p>
                
                <div className="flex justify-between gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => onEdit(customer)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground" 
                    onClick={() => onDelete(customer.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
