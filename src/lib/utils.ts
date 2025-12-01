import { v4 as uuidv4 } from 'uuid';

export function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = uuidv4().split('-')[0];
  return `VTU-${timestamp}-${randomPart}`.toUpperCase();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(070|080|081|090|091)\d{8}$/;
  return phoneRegex.test(phone);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizePhoneNumber(phone: string): string {
  // Remove spaces, dashes, and other non-numeric characters
  let sanitized = phone.replace(/\D/g, '');
  
  // If number starts with 234, replace with 0
  if (sanitized.startsWith('234')) {
    sanitized = '0' + sanitized.slice(3);
  }
  
  // If number doesn't start with 0, add it
  if (!sanitized.startsWith('0')) {
    sanitized = '0' + sanitized;
  }
  
  return sanitized;
}

export function getNetworkFromPhone(phone: string): string | null {
  const sanitized = sanitizePhoneNumber(phone);
  const prefix = sanitized.slice(0, 4);
  
  const mtnPrefixes = ['0703', '0706', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913'];
  const gloPrefixes = ['0705', '0805', '0807', '0811', '0815', '0905', '0915'];
  const airtelPrefixes = ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0907', '0912'];
  const nineMobilePrefixes = ['0809', '0817', '0818', '0908', '0909'];
  
  if (mtnPrefixes.includes(prefix)) return 'MTN';
  if (gloPrefixes.includes(prefix)) return 'GLO';
  if (airtelPrefixes.includes(prefix)) return 'AIRTEL';
  if (nineMobilePrefixes.includes(prefix)) return '9MOBILE';
  
  return null;
}
