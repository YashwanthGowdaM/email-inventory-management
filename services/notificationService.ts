
import { SendNotificationRequest } from '../types';

export const notificationService = {
  send: async (request: SendNotificationRequest): Promise<void> => {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Sending Notification:', request);
    
    // Simulate potential failure
    if (Math.random() > 0.95) {
      throw new Error('Service unavailable. Please try again later.');
    }
  }
};
