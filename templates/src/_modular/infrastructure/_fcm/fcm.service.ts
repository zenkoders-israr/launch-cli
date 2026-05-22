import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);

  constructor(private config: ConfigService) {}

  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.getOrThrow<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.config.getOrThrow<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.config
            .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  /** Send a push notification to a single device token */
  async sendToDevice(fcmToken: string, payload: PushPayload): Promise<string> {
    const messageId = await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    this.logger.log(`FCM sent to ${fcmToken.slice(0, 12)}… → ${messageId}`);
    return messageId;
  }

  /** Send to multiple tokens (batch, max 500 per call) */
  async sendMulticast(fcmTokens: string[], payload: PushPayload): Promise<admin.messaging.BatchResponse> {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    this.logger.log(
      `FCM multicast: ${response.successCount} sent, ${response.failureCount} failed`,
    );
    return response;
  }

  /** Send to a topic (e.g. 'news', 'promotions') */
  async sendToTopic(topic: string, payload: PushPayload): Promise<string> {
    const messageId = await admin.messaging().send({
      topic,
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
    });
    return messageId;
  }

  /** Subscribe device tokens to a topic */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    await admin.messaging().subscribeToTopic(tokens, topic);
  }

  /** Unsubscribe device tokens from a topic */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    await admin.messaging().unsubscribeFromTopic(tokens, topic);
  }
}
