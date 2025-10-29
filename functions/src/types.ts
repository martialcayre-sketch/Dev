export type Role = 'practitioner' | 'patient';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  displayName?: string;
  createdAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  emailVerified: boolean;
  chosenPractitionerId?: string;
  approvalStatus?: ApprovalStatus;
  approvedAt?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
}
