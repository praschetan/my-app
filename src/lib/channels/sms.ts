export interface SMSConfig {
  provider: "twilio";
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface SMSMessage {
  to: string;
  body: string;
  metadata?: Record<string, any>;
}

export class SMSService {
  constructor(private config: SMSConfig) {}

  async send(message: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // TODO: Implement actual SMS sending in Phase 5
    console.log("📱 SMS would be sent:", {
      to: message.to,
      body: message.body.slice(0, 50) + "...",
    });

    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
  }

  async sendBatch(messages: SMSMessage[]): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    errors: Array<{ phone: string; error: string }>;
  }> {
    // TODO: Implement batch sending
    console.log(`📱 Batch SMS: ${messages.length} messages`);

    return {
      success: true,
      sent: messages.length,
      failed: 0,
      errors: [],
    };
  }

  async testConnection(): Promise<boolean> {
    // TODO: Implement connection test
    return true;
  }
}

export function createSMSService(config: SMSConfig): SMSService {
  return new SMSService(config);
}
