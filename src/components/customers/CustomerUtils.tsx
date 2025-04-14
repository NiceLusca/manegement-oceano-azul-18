
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
