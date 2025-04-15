
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  startDateInput: string;
  endDateInput: string;
  setStartDateInput: (input: string) => void;
  setEndDateInput: (input: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  startDateInput,
  endDateInput,
  setStartDateInput,
  setEndDateInput
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="space-y-2">
        <Label htmlFor="start-date">Data inicial</Label>
        <div className="flex">
          <Input 
            id="start-date" 
            value={startDateInput} 
            onChange={e => setStartDateInput(e.target.value)} 
            placeholder="DD/MM/AAAA" 
            className="w-[150px]" 
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar 
                mode="single" 
                selected={startDate} 
                onSelect={setStartDate} 
                initialFocus 
                locale={ptBR} 
                className="p-3 pointer-events-auto" 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="end-date">Data final</Label>
        <div className="flex">
          <Input 
            id="end-date" 
            value={endDateInput} 
            onChange={e => setEndDateInput(e.target.value)} 
            placeholder="DD/MM/AAAA" 
            className="w-[150px]" 
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar 
                mode="single" 
                selected={endDate} 
                onSelect={setEndDate} 
                initialFocus 
                locale={ptBR} 
                className="p-3 pointer-events-auto" 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
