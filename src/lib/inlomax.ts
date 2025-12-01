import {
  InlomaxAirtimeRequest,
  InlomaxAirtimeResponse,
  InlomaxDataRequest,
  InlomaxDataResponse,
  InlomaxElectricityRequest,
  InlomaxElectricityResponse,
  InlomaxCableRequest,
  InlomaxCableResponse,
  InlomaxEducationRequest,
  InlomaxEducationResponse,
  InlomaxVerifyMeterRequest,
  InlomaxVerifyMeterResponse,
  InlomaxVerifySmartCardRequest,
  InlomaxVerifySmartCardResponse,
  InlomaxServicesResponse,
  InlomaxBalanceResponse,
  InlomaxTransactionDetailsResponse,
} from '@/types/inlomax';

const INLOMAX_BASE_URL = process.env.INLOMAX_API_URL || 'https://www.inlomax.com/api';

function getApiKey(): string {
  const apiKey = process.env.INLOMAX_API_KEY;
  if (!apiKey) {
    throw new Error('INLOMAX_API_KEY environment variable is not configured');
  }
  return apiKey;
}

async function makeRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'POST', body?: object): Promise<T> {
  const apiKey = getApiKey();
  const url = `${INLOMAX_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Inlomax API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Get available services
export async function getServices(): Promise<InlomaxServicesResponse> {
  return makeRequest<InlomaxServicesResponse>('/services/', 'GET');
}

// Get Wallet Balance from Inlomax
export async function getBalance(): Promise<InlomaxBalanceResponse> {
  return makeRequest<InlomaxBalanceResponse>('/balance/', 'GET');
}

// Airtime VTU
export async function airtime(data: InlomaxAirtimeRequest): Promise<InlomaxAirtimeResponse> {
  return makeRequest<InlomaxAirtimeResponse>('/topup/', 'POST', data);
}

// Data VTU
export async function data(dataRequest: InlomaxDataRequest): Promise<InlomaxDataResponse> {
  return makeRequest<InlomaxDataResponse>('/data/', 'POST', dataRequest);
}

// Validate Cable Smart Card
export async function validateCable(cableData: InlomaxVerifySmartCardRequest): Promise<InlomaxVerifySmartCardResponse> {
  return makeRequest<InlomaxVerifySmartCardResponse>('/validateiuc/', 'POST', cableData);
}

// Subscribe Cable TV
export async function subCable(cableData: InlomaxCableRequest): Promise<InlomaxCableResponse> {
  return makeRequest<InlomaxCableResponse>('/cablesub/', 'POST', cableData);
}

// Validate Meter Number
export async function validateMeter(meterData: InlomaxVerifyMeterRequest): Promise<InlomaxVerifyMeterResponse> {
  return makeRequest<InlomaxVerifyMeterResponse>('/validatemeter/', 'POST', meterData);
}

// Pay Electricity Bill
export async function payElectric(electricData: InlomaxElectricityRequest): Promise<InlomaxElectricityResponse> {
  return makeRequest<InlomaxElectricityResponse>('/billpayment/', 'POST', electricData);
}

// Education Pins
export async function education(educationData: InlomaxEducationRequest): Promise<InlomaxEducationResponse> {
  return makeRequest<InlomaxEducationResponse>('/epin/', 'POST', educationData);
}

// Get Transaction Details
export async function transactionDetails(requestId: string): Promise<InlomaxTransactionDetailsResponse> {
  return makeRequest<InlomaxTransactionDetailsResponse>(`/transaction/?request_id=${encodeURIComponent(requestId)}`, 'GET');
}

// Get data plans (additional utility)
export async function getDataPlans(network: string): Promise<{ plans: { plan_id: string; plan: string; amount: number }[] }> {
  return makeRequest<{ plans: { plan_id: string; plan: string; amount: number }[] }>(`/get_data_plans/?network=${encodeURIComponent(network)}`, 'GET');
}

// Get Cable Plans (additional utility)
export async function getCablePlans(cablename: string): Promise<{ plans: { plan_id: string; name: string; amount: number }[] }> {
  return makeRequest<{ plans: { plan_id: string; name: string; amount: number }[] }>(`/get_cable_plans/?cablename=${encodeURIComponent(cablename)}`, 'GET');
}

// Legacy exports for backward compatibility
export const purchaseAirtime = airtime;
export const purchaseData = data;
export const payElectricityBill = payElectric;
export const verifyMeterNumber = validateMeter;
export const subscribeCableTV = subCable;
export const verifySmartCard = validateCable;
export const purchaseEducationPins = education;
export const getInlomaxBalance = getBalance;

export const inlomaxService = {
  // Required functions per specification
  getServices,
  getBalance,
  airtime,
  data,
  validateCable,
  subCable,
  validateMeter,
  payElectric,
  education,
  transactionDetails,
  // Additional utility functions
  getDataPlans,
  getCablePlans,
  // Legacy aliases for backward compatibility
  purchaseAirtime,
  purchaseData,
  payElectricityBill,
  verifyMeterNumber,
  subscribeCableTV,
  verifySmartCard,
  purchaseEducationPins,
  getInlomaxBalance,
};

export default inlomaxService;
