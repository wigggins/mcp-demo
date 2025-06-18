export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  component?: {
    type: string;
    data: any;
    metadata?: any;
  };
}

export interface CareCenterData {
  id: string;
  name: string;
  daily_capacity: number;
  zip_code: string;
  operating_days?: number[];
  created_at: string;
  updated_at: string;
} 