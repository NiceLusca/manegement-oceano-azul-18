
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CsvImportDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onImportSuccess: () => void;
}

export const CsvImportDialog: React.FC<CsvImportDialogProps> = ({ 
  open, 
  setOpen, 
  onImportSuccess 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== 'text/csv') {
        setError('O arquivo deve estar no formato CSV');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDownloadSample = () => {
    // Create sample CSV content
    const csvContent = 
      'nome,email,telefone,origem,status,valor,responsavel,observacoes\n' +
      'João Silva,joao@exemplo.com,11999999999,Naie,lead,1000,,Cliente interessado\n' +
      'Maria Oliveira,maria@exemplo.com,11888888888,1k por Dia,prospect,2500,101,Aguardando retorno';
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_importacao_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processCSV = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text.split('\n');
          const headers = rows[0].toLowerCase().split(',');
          
          // Basic validation
          const requiredColumns = ['nome', 'email', 'origem', 'status'];
          for (const col of requiredColumns) {
            if (!headers.includes(col)) {
              throw new Error(`Coluna obrigatória ausente: ${col}`);
            }
          }
          
          // Parse CSV data
          const customers = [];
          
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty lines
            
            const values = rows[i].split(',');
            const customer: any = {};
            
            for (let j = 0; j < headers.length; j++) {
              const header = headers[j].trim();
              const value = values[j]?.trim() || '';
              
              // Map CSV headers to database fields
              switch (header) {
                case 'nome':
                  customer.name = value;
                  break;
                case 'email':
                  customer.email = value;
                  break;
                case 'telefone':
                  customer.phone = value;
                  break;
                case 'origem':
                  customer.origem = value;
                  break;
                case 'status':
                  customer.status = value;
                  break;
                case 'valor':
                  customer.value = parseFloat(value) || 0;
                  break;
                case 'responsavel':
                  customer.assigned_to = value;
                  break;
                case 'observacoes':
                  customer.notes = value;
                  break;
              }
            }
            
            // Add timestamps
            const now = new Date().toISOString();
            customer.last_contact = now;
            customer.created_at = now;
            customer.updated_at = now;
            
            customers.push(customer);
          }
          
          // Insert into database
          if (customers.length > 0) {
            const { data, error } = await supabase
              .from('customers')
              .insert(customers)
              .select();
              
            if (error) throw new Error(`Erro ao inserir registros: ${error.message}`);
            
            console.log('Customers imported:', data);
          } else {
            throw new Error('Nenhum registro válido encontrado no arquivo');
          }
          
          setIsProcessing(false);
          setSuccess(true);
          
          toast({
            title: "Importação concluída",
            description: `${customers.length} leads importados com sucesso.`,
          });
          
          // Reset after 2 seconds
          setTimeout(() => {
            setFile(null);
            setOpen(false);
            onImportSuccess();
          }, 2000);
          
        } catch (error: any) {
          setIsProcessing(false);
          setError(error.message || 'Erro ao processar o arquivo CSV');
        }
      };
      
      reader.onerror = () => {
        setIsProcessing(false);
        setError('Erro ao ler o arquivo');
      };
      
      reader.readAsText(file);
      
    } catch (error: any) {
      setIsProcessing(false);
      setError(error.message || 'Ocorreu um erro inesperado');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Leads via CSV</DialogTitle>
          <DialogDescription>
            Faça o upload de um arquivo CSV contendo seus leads. 
            Baixe o modelo para ver o formato esperado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={handleDownloadSample}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar Modelo CSV
            </Button>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="csv-file">Arquivo CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200 mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>Importação concluída com sucesso!</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button 
            onClick={processCSV} 
            disabled={!file || isProcessing || success}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>Processando...</>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Importar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;
