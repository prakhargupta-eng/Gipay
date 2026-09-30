export interface ForgetTransactionPinModalProps {
  visible?: boolean;
  onClose?: () => void;
  email?: string;
  onSuccess?: () => void;
}

export interface ForgetTransactionPinScreenProps {
  route?: { params?: { email?: string; onSuccess?: () => void } };
  navigation?: any;
  email?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export type ResetTransactionPinModalProps = ForgetTransactionPinModalProps;
export type ResetTransactionPinScreenProps = ForgetTransactionPinScreenProps;
