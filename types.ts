
export interface AppGroup {
  id: string;
  appGroupName: string;
  leadPocEmails: string[];
  teamMemberEmails: string[];
  groupDlEmails: string[];
  dependentGroupDlEmails: string[];
  additionalGroupDlEmails: string[];
  createdAt: number;
}

export type View = 'inventory' | 'notification';

export interface EmailDraft {
  subject: string;
  body: string;
}

export interface SendNotificationRequest {
  to: string;
  cc: string;
  subject: string;
  body: string;
  selectedGroupIds: string[];
}
