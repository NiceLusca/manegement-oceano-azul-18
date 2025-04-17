
export const translateStatus = (status: string) => {
  switch (status) {
    case 'lead': return 'lead';
    case 'prospect': return 'prospecto';
    case 'customer': return 'cliente';
    case 'churned': return 'perdido';
    default: return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'lead': return 'bg-yellow-100 text-yellow-800';
    case 'prospect': return 'bg-blue-100 text-blue-800';
    case 'customer': return 'bg-green-100 text-green-800';
    default: return 'bg-red-100 text-red-800';
  }
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove non-numeric characters
  const numericPhone = phone.replace(/\D/g, '');
  
  // Format based on length
  if (numericPhone.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 7)}-${numericPhone.slice(7)}`;
  } else if (numericPhone.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 6)}-${numericPhone.slice(6)}`;
  }
  
  // Return original if format doesn't match
  return phone;
};

export const getCustomerStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'lead':
      return 'secondary';
    case 'prospect':
      return 'default';
    case 'customer':
      return 'default';
    case 'churned':
      return 'destructive';
    default:
      return 'secondary';
  }
};
