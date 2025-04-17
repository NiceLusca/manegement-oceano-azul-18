
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate sample CSV content for customer imports
 * @returns string CSV content
 */
export const generateSampleCsvContent = (): string => {
  return 'nome,email,telefone,origem,status,valor,responsavel,observacoes\n' +
    'João Silva,joao@exemplo.com,11999999999,Naie,lead,1000,,Cliente interessado\n' +
    'Maria Oliveira,maria@exemplo.com,11888888888,1k por Dia,prospect,2500,101,Aguardando retorno';
};

/**
 * Download a sample CSV file for customer imports
 */
export const downloadSampleCsv = () => {
  const csvContent = generateSampleCsvContent();
  
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

/**
 * Process and validate a CSV file for customer import
 */
export const processCSVFile = async (file: File, onSuccess: () => void) => {
  return new Promise<boolean>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Falha ao ler o conteúdo do arquivo');
        }
        
        const text = e.target.result as string;
        
        // Check for empty file
        if (!text.trim()) {
          throw new Error('O arquivo está vazio');
        }
        
        const rows = text.split('\n');
        
        // Check if there's at least a header and one data row
        if (rows.length < 2) {
          throw new Error('O arquivo deve conter pelo menos o cabeçalho e uma linha de dados');
        }
        
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
        let lineErrors = [];
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty lines
          
          const values = rows[i].split(',');
          
          // Check if number of values matches number of headers
          if (values.length !== headers.length) {
            lineErrors.push(`Linha ${i}: número de colunas não corresponde ao cabeçalho`);
            continue;
          }
          
          const customer: any = {};
          
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j].trim();
            const value = values[j]?.trim() || '';
            
            // Map CSV headers to database fields
            switch (header) {
              case 'nome':
                if (!value) {
                  lineErrors.push(`Linha ${i}: Nome é obrigatório`);
                  continue;
                }
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
                // Validate status
                const validStatus = ['lead', 'prospect', 'customer', 'churned'];
                customer.status = validStatus.includes(value.toLowerCase()) ? 
                  value.toLowerCase() : 'lead';
                break;
              case 'valor':
                // Ensure value is a valid number
                customer.value = value ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 0;
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
        
        // Report line errors if any
        if (lineErrors.length > 0) {
          throw new Error(`Problemas encontrados no arquivo:\n${lineErrors.join('\n')}`);
        }
        
        // Insert into database
        if (customers.length > 0) {
          console.log('Attempting to insert customers:', customers);
          
          const { data, error } = await supabase
            .from('customers')
            .insert(customers)
            .select();
            
          if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Erro ao inserir registros: ${error.message}`);
          }
          
          console.log('Customers imported:', data);
        } else {
          throw new Error('Nenhum registro válido encontrado no arquivo');
        }
        
        // Call the success callback
        onSuccess();
        resolve(true);
        
      } catch (error: any) {
        console.error('CSV processing error:', error);
        reject(error.message || 'Erro ao processar o arquivo CSV');
      }
    };
    
    reader.onerror = (e) => {
      console.error('FileReader error:', e);
      reject('Erro ao ler o arquivo. Verifique se o formato é válido.');
    };
    
    reader.readAsText(file);
  });
};
