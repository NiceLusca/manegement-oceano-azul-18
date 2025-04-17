
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
import { Download, Upload } from 'lucide-react';
import { FileUploader } from './csv/FileUploader';
import { downloadSampleCsv } from './csv/csvUtils';
import { useToast } from '@/hooks/use-toast';

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

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
  };

  const processCSV = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Use dynamic import to avoid circular dependencies
      const { processCSVFile } = await import('./csv/csvUtils');
      
      // Call the function with the onImportSuccess callback
      await processCSVFile(file, onImportSuccess);
      
      setIsProcessing(false);
      setSuccess(true);
      
      toast({
        title: "Sucesso",
        description: "Clientes importados com sucesso!",
        variant: "default"
      });
      
      // Reset after 2 seconds and call the success callback
      setTimeout(() => {
        setFile(null);
        setOpen(false);
      }, 2000);
      
    } catch (error: any) {
      setIsProcessing(false);
      setError(error.message || 'Ocorreu um erro inesperado');
      
      toast({
        title: "Erro na importação",
        description: error.message || 'Ocorreu um erro ao processar o arquivo',
        variant: "destructive"
      });
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
              onClick={downloadSampleCsv}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar Modelo CSV
            </Button>
          </div>
          
          <FileUploader
            onFileChange={handleFileChange}
            error={error}
            success={success}
            isProcessing={isProcessing}
          />
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
