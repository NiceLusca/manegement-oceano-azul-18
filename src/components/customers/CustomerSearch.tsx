
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CustomerSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  setViewMode 
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button 
          variant={viewMode === 'grid' ? 'default' : 'outline'} 
          onClick={() => setViewMode('grid')}
          size="sm"
        >
          Cards
        </Button>
        <Button 
          variant={viewMode === 'table' ? 'default' : 'outline'} 
          onClick={() => setViewMode('table')}
          size="sm"
        >
          Tabela
        </Button>
      </div>
    </div>
  );
};

export default CustomerSearch;
