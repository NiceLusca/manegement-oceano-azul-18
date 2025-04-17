
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== 'text/csv') {
        onFileChange(null);
        return;
      }
      
      onFileChange(selectedFile);
    }
  };

  return (
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
  );
};
