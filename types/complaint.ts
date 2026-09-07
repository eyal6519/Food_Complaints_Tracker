export type ComplaintStatus = 'PENDING' | 'RESOLVED' | 'OVERDUE';

export interface Complaint {
  id: string;
  category: string;
  supplierName: string;
  warehouseName: string;
  dateSentToUs: string; // YYYY-MM-DD
  dateSentToSupplier: string; // YYYY-MM-DD
  description: string;
  dateResponseReceived: string | null; // YYYY-MM-DD or null
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function getComputedStatus(
  complaint: Pick<Complaint, 'dateResponseReceived' | 'dateSentToSupplier'>,
  overdueThresholdDays: number = 14
): ComplaintStatus {
  if (complaint.dateResponseReceived && complaint.dateResponseReceived.trim() !== '') {
    return 'RESOLVED';
  }
  if (complaint.dateSentToSupplier && complaint.dateSentToSupplier.trim() !== '') {
    const sentDate = new Date(complaint.dateSentToSupplier);
    const today = new Date();
    // Normalize times to midnight for clean day calculation
    sentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - sentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > overdueThresholdDays) {
      return 'OVERDUE';
    }
  }
  return 'PENDING';
}

export function getDaysPending(dateSentToSupplier: string): number {
  if (!dateSentToSupplier) return 0;
  const sentDate = new Date(dateSentToSupplier);
  const today = new Date();
  sentDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - sentDate.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}
