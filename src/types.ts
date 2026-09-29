export interface Env {
  BUCKPAY_TOKEN?: string;
  BUCKPAY_USER_AGENT?: string;
  WEBHOOK_URL?: string;
}

export interface PixCreateInput {
  amount: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_document: string;
  product_name?: string;
}

export interface PixCreateOutput {
  success: boolean;
  transaction_id?: string;
  pix_code?: string;
  qrcode_base64?: string;
  status?: string;
  error?: string;
}
