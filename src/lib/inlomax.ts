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
} from '@/types/inlomax';

const INLOMAX_BASE_URL = process.env.INLOMAX_API_URL || 'https://www.inlomax.com/api';
const INLOMAX_TOKEN = process.env.INLOMAX_API_TOKEN;

async function makeRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'POST', body?: object): Promise<T> {
  if (!INLOMAX_TOKEN) {
    throw new Error('Inlomax API token not configured');
  }

  const url = `${INLOMAX_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Token ${INLOMAX_TOKEN}`,
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

// Airtime VTU
export async function purchaseAirtime(data: InlomaxAirtimeRequest): Promise<InlomaxAirtimeResponse> {
  return makeRequest<InlomaxAirtimeResponse>('/topup/', 'POST', data);
}

// Data VTU
export async function purchaseData(data: InlomaxDataRequest): Promise<InlomaxDataResponse> {
  return makeRequest<InlomaxDataResponse>('/data/', 'POST', data);
}

// Get data plans
export async function getDataPlans(network: string): Promise<{ plans: { plan_id: string; plan: string; amount: number }[] }> {
  return makeRequest<{ plans: { plan_id: string; plan: string; amount: number }[] }>(`/get_data_plans/?network=${network}`, 'GET');
}

// Electricity Bill Payment
export async function payElectricityBill(data: InlomaxElectricityRequest): Promise<InlomaxElectricityResponse> {
  return makeRequest<InlomaxElectricityResponse>('/billpayment/', 'POST', data);
}

// Verify Meter Number
export async function verifyMeterNumber(data: InlomaxVerifyMeterRequest): Promise<InlomaxVerifyMeterResponse> {
  return makeRequest<InlomaxVerifyMeterResponse>('/validatemeter/', 'POST', data);
}

// Cable TV Subscription
export async function subscribeCableTV(data: InlomaxCableRequest): Promise<InlomaxCableResponse> {
  return makeRequest<InlomaxCableResponse>('/cablesub/', 'POST', data);
}

// Get Cable Plans
export async function getCablePlans(cablename: string): Promise<{ plans: { plan_id: string; name: string; amount: number }[] }> {
  return makeRequest<{ plans: { plan_id: string; name: string; amount: number }[] }>(`/get_cable_plans/?cablename=${cablename}`, 'GET');
}

// Verify Smart Card
export async function verifySmartCard(data: InlomaxVerifySmartCardRequest): Promise<InlomaxVerifySmartCardResponse> {
  return makeRequest<InlomaxVerifySmartCardResponse>('/validateiuc/', 'POST', data);
}

// Education Pins
export async function purchaseEducationPins(data: InlomaxEducationRequest): Promise<InlomaxEducationResponse> {
  return makeRequest<InlomaxEducationResponse>('/epin/', 'POST', data);
}

// Get Wallet Balance from Inlomax
export async function getInlomaxBalance(): Promise<{ balance: number }> {
  return makeRequest<{ balance: number }>('/balance/', 'GET');
}

export const inlomaxService = {
  purchaseAirtime,
  purchaseData,
  getDataPlans,
  payElectricityBill,
  verifyMeterNumber,
  subscribeCableTV,
  getCablePlans,
  verifySmartCard,
  purchaseEducationPins,
  getInlomaxBalance,
};

export default inlomaxService;
