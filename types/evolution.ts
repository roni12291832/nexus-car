export interface WebhookConfig {
  url: string;
  byEvents: boolean;
  base64: boolean;
  headers: Record<string, string>;
  events: string[];
}

export interface InstanceCreatePayload {
  instanceName: string;
  number: string;
  qrcode: boolean;
  integration: "WHATSAPP-BAILEYS" | "WHATSAPP-BUSINESS" | "EVOLUTION";
  groupsIgnore?: boolean;
  webhook?: WebhookConfig;
}

export interface InstanceCreateResponse {
  instance: string;
  qrcode?: string;
  status: string;
  [key: string]: unknown; // se a API mandar extras
}
