
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
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="origem" className="text-right">
          Origem
        </Label>
        <Select
          value={originOptions.includes(origem) ? origem : 'Outro'}
          onValueChange={handleOrigemChange}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione a origem" />
          </SelectTrigger>
          <SelectContent>
            {originOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(!originOptions.includes(origem) || origem === '') && (
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
