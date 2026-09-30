import colors from '@styles/colors';

export const formatStatus = (status?: string) => {
  if (!status) return 'N/A';

  const trimmed = status.trim();
  const lower = trimmed.toLowerCase();

  // Known custom displays
  if (lower === 'inprogress') return 'In Progress';
  if (lower === 'clockedin') return 'Clocked In';
  if (lower === 'not started') return 'Not Started';
  if (
    lower === 'clock_out_required' ||
    lower === 'clock out required' ||
    lower === 'clock-out-required' ||
    lower === 'clockoutrequired'
  ) {
    return 'Clock Out Required';
  }
  if (
    lower === 'pendingapproval' ||
    lower === 'pending approval'
  ) {
    return 'Pending Approval';
  }

  // Separate camelCase boundaries (e.g. pendingApproval -> pending Approval)
  // and replace underscores and hyphens with spaces
  const spaced = trimmed
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2');

  // Title-case each word (handles UPPERCASE, lowercase, or mixed)
  return spaced
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const getStatusStyles = (status?: string) => {
  const raw = status?.trim() || '';
  const s = raw.toLowerCase();
  const normalized = s.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const label = formatStatus(status);

  const upcomingStates = [
    'upcoming',
    'pending',
    'pending approval',
    'pendingapproval',
    'booked',
    'refund',
    'requested',
  ];
  const errorStates = [
    'cancelled',
    'canceled',
    'rejected',
    'declined',
    'failed',
    'expired',
  ];
  const successStates = [
    'paid',
    'successful',
    'active',
    'open',
    'completed',
    'inprogress',
    'in progress',
    'clocked-in',
    'clockedin',
    'clocked in',
    'accepted',
    'approved',
    'success',
    'confirmed',
  ];
  const warningStates = [
    'in review',
    'inreview',
    'processing',
    'clock out required',
    'clock_out_required',
    'clock-out-required',
    'clockoutrequired',
    'left',
  ];

  if (upcomingStates.includes(s) || upcomingStates.includes(normalized)) {
    return {
      badge: { backgroundColor: '#E0F2FE' },
      text: { color: '#0EA5E9' },
      label,
    };
  }
  
  if (errorStates.includes(s) || errorStates.includes(normalized)) {
    return {
      badge: { backgroundColor: '#FEE2E2' },
      text: { color: '#EF4444' },
      label,
    };
  }

  if (successStates.includes(s) || successStates.includes(normalized)) {
    return {
      badge: { backgroundColor: '#DCFCE7' },
      text: { color: '#16A34A' },
      label,
    };
  }

  if (s === 'not started' || normalized === 'not started') {
    return {
      badge: { backgroundColor: '#F3F4F6' },
      text: { color: '#9CA3AF' },
      label,
    };
  }

  if (warningStates.includes(s) || warningStates.includes(normalized)) {
    return {
      badge: { backgroundColor: '#FEF3C7' },
      text: { color: '#D97706' },
      label,
    };
  }

  // Default fallback
  return {
    badge: { backgroundColor: '#F0EDFF' },
    text: { color: '#1B00A6' },
    label,
  };
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {

  escrowFund: 'Escrow Funding',
  refundUnusedEscrow: 'Unused Escrow Refund',
  disputedEscrowRefund: 'Disputed Escrow Refund',
  paidToContractor: 'Contractor Payment',
  addMoney: 'Bank Deposit',
  escrowAllocation: 'Escrow Allocation',
  withdrawal: 'Instant Withdrawal',
  cancellationFeeRevenue: 'Cancellation Fee',
  withdrawalFeeRevenue: 'Withdrawal Fee',
  instantTransferFeeRevenue: 'Instant Transfer Fee',
  bookingFeeRevenue: 'Fee',
  transactionFeeRevenue: 'Transaction Fee',
  refundAttendenceSettleEscrow: 'Attendance Refund',
  refundNotInvitedJobEscrow: 'Invitation Refund',
  refundUnallocatedEscrow: 'Unallocated Escrow Refund',
  cancelJob: 'Job cancelation refund',
  noShowPenaltyRevenue: 'No-Show Penalty',
  noShowPenalty: 'No-Show Charge',
  additionalEscrowAllocate: 'Additional Escrow',
  refundEscrowAllocate: 'Escrow Refund',
  additionalApproveHourEscrowAllocate: 'Approved Hours Funding',
  additionalEscrowAllocateRefund: 'Additional Escrow Refund',
  addMoneyEft: 'Bank Deposit',
  eftWithdrawal: 'Standard Bank Withdrawal',
};
 

export const formatTransactionType = (type?: string) => {
  if (!type) return '';
  if (TRANSACTION_TYPE_LABELS[type]) {
    return TRANSACTION_TYPE_LABELS[type];
  }
  // Convert camelCase to Title Case (e.g. escrowFund -> Escrow Fund)
  const result = type.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};
