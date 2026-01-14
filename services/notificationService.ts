
import { SendNotificationRequest } from '../types';

export const notificationService = {
  send: async (request: SendNotificationRequest): Promise<void> => {
    // 1. Convert HTML body to Plain Text for mailto compatibility
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = request.body;
    
    // Simple conversion: replace <p> and <br> with newlines, then get textContent
    const plainTextBody = tempDiv.innerText || tempDiv.textContent || "";

    // 2. Construct the mailto URL
    const mailtoParams = new URLSearchParams();
    // URLSearchParams.toString() uses '+' for spaces, but mailto prefers %20
    const encodedSubject = encodeURIComponent(request.subject);
    const encodedBody = encodeURIComponent(plainTextBody);
    
    const mailtoLink = `mailto:${request.to}?cc=${request.cc}&subject=${encodedSubject}&body=${encodedBody}`;

    // 3. Trigger the email client
    // We use a temporary anchor to ensure it works across all browsers without blocking popups
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.click();

    console.log('Actual email triggered via mailto:', {
      to: request.to,
      cc: request.cc,
      subject: request.subject
    });
  }
};
