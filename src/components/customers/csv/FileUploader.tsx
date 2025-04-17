
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  error: string | null;
  success: boolean;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileChange,
  error,
  success,
  isProcessing
}) => {
  const [fileName, setFileName] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        onFileChange(null);
        setFileName('');
        return;
      }
      
      setFileName(selectedFile.name);
      onFileChange(selectedFile);
    } else {
      setFileName('');
      onFileChange(null);
    }
  };

  return (
    <div className="grid gap-4">
      <Label htmlFor="csv-file">Arquivo CSV</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
        />
        <label htmlFor="csv-file" className="w-full flex flex-col items-center cursor-pointer">
          <FileText className="h-10 w-10 text-gray-400 mb-2" />
          {fileName ? (
            <p className="text-sm font-medium text-gray-700">{fileName}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Clique para selecionar um arquivo</p>
              <p className="text-xs text-gray-500 mt-1">ou arraste e solte aqui</p>
            </>
          )}
        </label>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200 mt-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>Importação concluída com sucesso!</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
