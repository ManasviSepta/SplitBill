export interface Participant {
  id: string;
  name: string;
  isYou?: boolean;
  color: string; // Hex or tailwind color class
  avatarColor?: string; // Persistent pastel avatar color
  avatarInitials: string;
  initials?: string;
  upiId?: string;
  phone?: string;
}

export interface ItemAssignment {
  itemId: string;
  participantIds: string[];
  splitMode: "equal" | "custom";
  customShares?: Record<string, number>; // participantId -> percentage or fraction
}

export interface ParticipantBreakdown {
  participantId: string;
  name: string;
  initials: string;
  color: string;
  isYou?: boolean;
  itemCount: number;
  itemNames: string[];
  foodSubtotal: number;
  taxShare: number;
  serviceShare: number;
  discountShare: number;
  grandTotal: number;
  percentageOfBill: number;
}

export interface AllocationStats {
  totalItems: number;
  assignedItemsCount: number;
  unassignedItemsCount: number;
  allocatedSubtotal: number;
  totalSubtotal: number;
  percentageAllocated: number;
  isFullyAllocated: boolean;
}
