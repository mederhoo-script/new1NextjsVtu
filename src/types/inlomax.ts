// Inlomax API Response Types
export interface InlomaxBaseResponse {
  status: boolean;
  message: string;
}

// Services Response
export interface InlomaxServicesResponse extends InlomaxBaseResponse {
  services?: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
  }>;
}

// Balance Response
export interface InlomaxBalanceResponse extends InlomaxBaseResponse {
  balance: number;
}

// Transaction Details Response
export interface InlomaxTransactionDetailsResponse extends InlomaxBaseResponse {
  request_id?: string;
  type?: string;
  amount?: number;
  transaction_status?: string;
  date?: string;
  details?: Record<string, unknown>;
}

export interface InlomaxAirtimeRequest {
  network: string;
  amount: number;
  mobile_number: string;
  Ported_number: boolean;
  airtime_type: string;
}

export interface InlomaxAirtimeResponse extends InlomaxBaseResponse {
  request_id?: string;
  amount?: number;
  network?: string;
  mobile_number?: string;
}

export interface InlomaxDataRequest {
  network: string;
  mobile_number: string;
  plan: string;
  Ported_number: boolean;
}

export interface InlomaxDataResponse extends InlomaxBaseResponse {
  request_id?: string;
  plan?: string;
  network?: string;
  mobile_number?: string;
}

export interface InlomaxDataPlan {
  plan_id: string;
  plan: string;
  amount: number;
  network: string;
}

export interface InlomaxElectricityRequest {
  disco_name: string;
  meter_number: string;
  amount: number;
  MeterType: string;
}

export interface InlomaxElectricityResponse extends InlomaxBaseResponse {
  request_id?: string;
  token?: string;
  units?: string;
  meter_number?: string;
  customer_name?: string;
  address?: string;
}

export interface InlomaxCableRequest {
  cablename: string;
  cableplan: string;
  smart_card_number: string;
}

export interface InlomaxCableResponse extends InlomaxBaseResponse {
  request_id?: string;
  cablename?: string;
  smart_card_number?: string;
  customer_name?: string;
}

export interface InlomaxCablePlan {
  plan_id: string;
  name: string;
  amount: number;
  cable: string;
}

export interface InlomaxEducationRequest {
  exam_name: string;
  quantity: number;
}

export interface InlomaxEducationResponse extends InlomaxBaseResponse {
  request_id?: string;
  pins?: Array<{
    pin: string;
    serial: string;
  }>;
}

export interface InlomaxVerifyMeterRequest {
  disco_name: string;
  meter_number: string;
  MeterType: string;
}

export interface InlomaxVerifyMeterResponse extends InlomaxBaseResponse {
  Customer_Name?: string;
  Customer_Address?: string;
  Meter_Number?: string;
}

export interface InlomaxVerifySmartCardRequest {
  cablename: string;
  smart_card_number: string;
}

export interface InlomaxVerifySmartCardResponse extends InlomaxBaseResponse {
  Customer_Name?: string;
  Status?: string;
  Current_Bouquet?: string;
  Due_Date?: string;
}

// Network options
export type NetworkType = 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';

// Disco (Electricity Distribution Companies)
export type DiscoType = 
  | 'IKEDC'
  | 'EKEDC'
  | 'IBEDC'
  | 'PHED'
  | 'KANO'
  | 'KADUNA'
  | 'EEDC'
  | 'JED'
  | 'AEDC';

// Cable TV providers
export type CableType = 'DSTV' | 'GOTV' | 'STARTIMES';

// Education exam types
export type ExamType = 'WAEC' | 'NECO' | 'NABTEB' | 'JAMB';

// Meter types
export type MeterType = 'prepaid' | 'postpaid';
