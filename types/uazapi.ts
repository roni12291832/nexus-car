export interface UazapiInstanceCreatePayload {
    name: string;
    systemName?: string;
    adminField01?: string;
    adminField02?: string;
}

export interface UazapiInstanceResponse {
    id: string;
    name: string;
    token: string;
    status: "disconnected" | "connecting" | "connected";
    createdAt: string;
}

export interface UazapiWebhookConfig {
    url: string;
    events: string[];
    excludeMessages?: string[];
    enabled?: boolean;
    addUrlEvents?: boolean;
    addUrlTypesMessages?: boolean;
}

export interface UazapiSendMessagePayload {
    number: string;
    text: string;
    linkPreview?: boolean;
    linkPreviewTitle?: string;
    linkPreviewDescription?: string;
    linkPreviewImage?: string;
    linkPreviewLarge?: boolean;
}
