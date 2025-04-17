
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
        
        // Call the success callback
        onSuccess();
        resolve(true);
        
      } catch (error: any) {
        reject(error.message || 'Erro ao processar o arquivo CSV');
      }
    };
    
    reader.onerror = () => {
      reject('Erro ao ler o arquivo');
    };
    
    reader.readAsText(file);
  });
};
