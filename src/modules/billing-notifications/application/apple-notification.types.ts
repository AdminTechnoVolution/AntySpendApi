/** Shapes from Apple's App Store Server Notifications V2 — see Apple's developer docs for the
 * full enum lists; only the fields Anty actually reads are declared here. */

export interface AppStoreNotificationRequestBody {
  signedPayload: string;
}

export interface AppStoreNotificationEnvelope {
  notificationType: string;
  subtype?: string;
  notificationUUID: string;
  data?: {
    bundleId?: string;
    environment?: string;
    signedTransactionInfo?: string;
    signedRenewalInfo?: string;
  };
}

export interface AppStoreRenewalInfo {
  originalTransactionId: string;
  productId: string;
  autoRenewStatus: number;
}
