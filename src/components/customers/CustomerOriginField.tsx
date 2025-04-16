
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomerOriginFieldProps {
  origem: string;
  originOptions: string[];
  customOrigin: string;
  handleOrigemChange: (value: string) => void;
  handleCustomOriginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CustomerOriginField: React.FC<CustomerOriginFieldProps> = ({
  origem,
  originOptions,
  customOrigin,
  handleOrigemChange,
  handleCustomOriginChange,
}) => {
  // Filtramos aqui para garantir que não exista "Outro" nos originOptions
  const filteredOptions = originOptions.filter(option => option !== 'Outro');
  
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="origem" className="text-right">
          Origem
        </Label>
        <Select
          value={filteredOptions.includes(origem) ? origem : 'Outro'}
          onValueChange={handleOrigemChange}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione a origem" />
          </SelectTrigger>
          <SelectContent>
            {filteredOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(!filteredOptions.includes(origem) || origem === '') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="customOrigem" className="text-right">
            Outra Origem
          </Label>
          <Input
            id="customOrigem"
            value={customOrigin}
            onChange={handleCustomOriginChange}
            className="col-span-3"
            placeholder="Especifique a origem"
          />
        </div>
      )}
    </>
  );
};
