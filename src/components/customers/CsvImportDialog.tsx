
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

  // Reset state when dialog is opened/closed
  React.useEffect(() => {
    if (!open) {
      // Small delay to avoid UI flicker
      const timer = setTimeout(() => {
        setFile(null);
        setError(null);
        setSuccess(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const processCSV = async () => {
    if (!file) {
      setError("Nenhum arquivo selecionado");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Use dynamic import to avoid circular dependencies
      const csvUtils = await import('./csv/csvUtils');
      
      // Call the function with the onImportSuccess callback
      await csvUtils.processCSVFile(file, onImportSuccess);
      
      setIsProcessing(false);
      setSuccess(true);
      
      toast({
        title: "Sucesso",
        description: "Clientes importados com sucesso!",
        variant: "default"
      });
      
      // Reset after 2 seconds and close dialog
      setTimeout(() => {
        setFile(null);
        setOpen(false);
      }, 2000);
      
    } catch (error: any) {
      console.error("CSV processing error:", error);
      setIsProcessing(false);
      setError(error.message || 'Ocorreu um erro inesperado');
      
      toast({
        title: "Erro na importação",
        description: "Não foi possível processar o arquivo. Verifique o formato e tente novamente.",
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
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              onClick={downloadSampleCsv}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <Download className="h-4 w-4" />
              Baixar Modelo CSV
            </Button>
            <p className="text-xs text-gray-500">
              Campos obrigatórios: nome, origem. 
              O campo 'responsavel' deve ser deixado em branco ou conter um ID válido.
            </p>
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
