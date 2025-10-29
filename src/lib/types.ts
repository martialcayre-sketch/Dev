import type { Timestamp } from 'firebase/firestore';

export type Role = 'practitioner' | 'patient';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  displayName?: string;
  createdAt: Timestamp;
  emailVerified: boolean;
  chosenPractitionerId?: string;
  approvalStatus?: ApprovalStatus;
  approvedAt?: Timestamp;
}
