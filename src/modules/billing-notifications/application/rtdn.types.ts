export interface SubscriptionNotification {
  version?: string;
  notificationType: number;
  purchaseToken: string;
  subscriptionId: string;
}

export interface DeveloperNotification {
  version?: string;
  packageName?: string;
  eventTimeMillis?: string;
  subscriptionNotification?: SubscriptionNotification;
  oneTimeProductNotification?: Record<string, unknown>;
  testNotification?: Record<string, unknown>;
}

export interface PubSubPushMessage {
  data?: string;
  messageId?: string;
  publishTime?: string;
  attributes?: Record<string, string>;
}

export interface PubSubPushBody {
  message?: PubSubPushMessage;
  subscription?: string;
}
