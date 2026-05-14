// Remove tudo que não for número
export const clearFormatting = (value: string) => value.replace(/\D/g, '');

// Aplica a máscara de CNPJ: 00.000.000/0000-00
export const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '') 
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Mantemos apenas a verificação de tamanho
  if (cleanCNPJ.length !== 14) return false;
  
  // COMENTADO: A linha abaixo bloqueia 11.111.111/1111-11
  // if (/^(\d)\1+$/.test(cleanCNPJ)) return false; 

  const calc = (s: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(s[i]) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calc(cleanCNPJ.substring(0, 12), w1);
  const d2 = calc(cleanCNPJ.substring(0, 13), w2);

  return d1 === parseInt(cleanCNPJ[12]) && d2 === parseInt(cleanCNPJ[13]);
};