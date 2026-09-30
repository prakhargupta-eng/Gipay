import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ClientTabBar from './ClientTabBar';
import CreateJobScreen from '@screens/client/tabview/home/createjob/CreateJobScreen';
import LocationSearchScreen from '@screens/client/tabview/home/createjob/LocationSearchScreen';
import JobPreviewScreen from '@screens/client/tabview/home/createjob/JobPreviewScreen';
import ContractorsScreen from '@screens/client/tabview/contractors/Main';
import ContractorProfileDetailScreen from '@screens/client/tabview/contractors/profileDetails/ContractorProfileDetailScreen';
import SelectJobScreen from '@screens/client/tabview/contractors/selectJob/SelectJobScreen';
import ReviewInvitationScreen from '@screens/client/tabview/contractors/ReviewInvitation/ReviewInvitationScreen';
import JobDetailsScreen from '@screens/client/tabview/jobs/common/jobDetails/JobDetailsScreen';
import AttendanceDetailsScreen from '@screens/client/tabview/jobs/common/AttendanceDetails/AttendanceDetailsScreen';
import PaymentDetailsScreen from '@screens/client/tabview/jobs/common/PaymentDetails/PaymentDetailsScreen';
import ManualClockInScreen from '@screens/client/tabview/jobs/common/ManualClockIn/ManualClockInScreen';
import PaymentMethodScreen from '@screens/client/tabview/profile/PaymentMethod';
import AddMoneyScreen from '@screens/client/tabview/profile/PaymentMethod/AddMoney';
import AddBankAccountScreen from '@screens/common/AddBankAccount';
import ClientProfileDetailsScreen from '@screens/client/tabview/profile/ProfileDetails/ClientProfileDetailsScreen';
import FAQScreen from '@screens/common/FAQScreen';
import DraftsScreen from '@screens/client/tabview/profile/Drafts/DraftsScreen';
import RatingsScreen from '@screens/contractor/tabview/profile/Rating/RatingsScreen';
import ChangePasswordScreen from '@screens/client/tabview/profile/ChangePassword/ChangePasswordScreen';
import ForgetTransactionPinScreen from '@screens/common/ForgetTransactionPinModal';
import VerifyCodeScreen from '@screens/client/auth/forgotPassword/verify/VerifyCodeScreen';
import InviteContractorsScreen from '@screens/client/tabview/home/createjob/InviteContractorsScreen';
import WebViewScreen from '@screens/common/WebViewScreen';
import DisputeHistoryScreen from '@screens/client/tabview/home/DisputeHistory';
import DisputeDetailsScreen from '@screens/client/tabview/home/DisputeHistory/DisputeDetails';
import JobInvitesScreen from '@screens/client/tabview/home/JobInvites';
import JobInviteDetailsScreen from '@screens/client/tabview/home/JobInvites/JobInviteDetails';
import PaymentsAndInvoicesScreen from '@screens/client/tabview/home/Payments/PaymentsAndInvoices';
import PaymentInvoiceDetailsScreen from '@screens/client/tabview/home/Payments/PaymentDetails';
import JobMatchesScreen from '@screens/client/tabview/home/JobMatches';
import JobMatchDetailsScreen from '@screens/client/tabview/home/JobMatches/JobMatchDetails';
import JobAwaitingApprovalScreen from '@screens/client/tabview/home/JobAwaitingApproval';
import JobAwaitingApprovalDetailsScreen from '@screens/client/tabview/home/JobAwaitingApproval/JobAwaitingApprovalDetails';
import NotificationsScreen from '@screens/common/NotificationsScreen';
import TransactionHistoryScreen from '@screens/client/tabview/wallet/TransactionHistory';
import WalletPaymentDetailsScreen from '@screens/client/tabview/wallet/WalletPaymentDetails';
import ChatScreen from '@screens/common/ChatScreen';

export type ClientAppStackParamList = {
  ClientTabBar: undefined;
  CreateJob: {
    selectedLocation?: string;
    latitude?: number;
    longitude?: number;
    draftData?: any;
    isEditing?: boolean;
    isCommingfromDraft?: boolean;
  };
  LocationSearch: undefined;
  PaymentMethod: undefined;
  AddMoney: undefined;
  AddBankAccount: { item?: any, isUpdate?: boolean, isComingFrom: string };
  Information: { type: 'privacy' | 'terms' | 'about' };
  FAQ: undefined;
  Ratings: undefined;
  ClientProfileDetails: {
    emailVerified?: boolean;
    newEmail?: string;
    mobileVerified?: boolean;
    newMobile?: string;
  } | undefined;
  Drafts: undefined;
  JobPreview: { jobData: any, isCommingfromDraft?: boolean };
  Contractors: undefined;
  ContractorProfileDetail: { contractor: any, jobId?: string, shouldShowButton?: boolean };
  JobDetails: { job: any };
  AttendanceDetails: { job: any };
  PaymentDetails: { job: any };
  ManualClockIn: { job: any };
  SelectJob: { contractor: any };
  ChangePassword: undefined;
  ForgetTransactionPin: { email?: string } | undefined;
  ResetTransactionPin: { email?: string } | undefined;
  verifyCode: {
    email?: string,
    mobile?: string,
    countryCode?: number,
    otpId?: string,
    flowType?: 'registration' | 'forgotPassword' | 'profileUpdate' | 'mobile-update' | 'client' | 'contractor',
    role?: 'client' | 'contractor',
    expiresIn?: number
  };
  InviteContractors: { jobId: string, };
  ReviewInvitation: { job: any };
  WebView: { url: string; title?: string };
  DisputeHistory: undefined;
  DisputeDetails: { disputeId: string; type: 'by' | 'for' };
  JobInvites: undefined;
  JobInviteDetails: { invitationId: string };
  PaymentsAndInvoices: undefined;
  PaymentInvoiceDetails: { invoiceData?: any; transactionId?: string };
  WalletPaymentDetails: { invoiceData?: any; transactionId?: string };
  JobMatches: undefined;
  JobMatchDetails: { jobData: any; isPending?: boolean };
  JobAwaitingApproval: undefined;
  JobAwaitingApprovalDetails: { jobData: any };
  Notifications: undefined;
  ChatScreen: { recipientName?: string; recipientAvatar?: string; jobId?: string; jobOrderId?: string; jobTitle?: string; isChatDisabled?: boolean; disabled?: boolean } | undefined;
  TransactionHistory: undefined;
};

const Stack = createNativeStackNavigator<ClientAppStackParamList>();

const ClientAppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="ClientTabBar" component={ClientTabBar} />
      <Stack.Screen name="CreateJob" component={CreateJobScreen} />
      <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
      <Stack.Screen name="AddBankAccount" component={AddBankAccountScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="Ratings" component={RatingsScreen} />
      <Stack.Screen name="ClientProfileDetails" component={ClientProfileDetailsScreen} />
      <Stack.Screen name="Drafts" component={DraftsScreen} />
      <Stack.Screen name="JobPreview" component={JobPreviewScreen} />
      <Stack.Screen name="Contractors" component={ContractorsScreen} />
      <Stack.Screen name="ContractorProfileDetail" component={ContractorProfileDetailScreen} />
      <Stack.Screen name="SelectJob" component={SelectJobScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="ForgetTransactionPin" component={ForgetTransactionPinScreen} />
      <Stack.Screen name="ResetTransactionPin" component={ForgetTransactionPinScreen} />
      <Stack.Screen name="verifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="InviteContractors" component={InviteContractorsScreen} />
      <Stack.Screen name="WebView" component={WebViewScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="AttendanceDetails" component={AttendanceDetailsScreen} />
      <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
      <Stack.Screen name="ManualClockIn" component={ManualClockInScreen} />
      <Stack.Screen name="DisputeHistory" component={DisputeHistoryScreen} />
      <Stack.Screen name="DisputeDetails" component={DisputeDetailsScreen} />
      <Stack.Screen name="JobInvites" component={JobInvitesScreen} />
      <Stack.Screen name="JobInviteDetails" component={JobInviteDetailsScreen} />
      <Stack.Screen name="PaymentsAndInvoices" component={PaymentsAndInvoicesScreen} />
      <Stack.Screen name="PaymentInvoiceDetails" component={PaymentInvoiceDetailsScreen} />
      <Stack.Screen name="WalletPaymentDetails" component={WalletPaymentDetailsScreen} />
      <Stack.Screen name="JobMatches" component={JobMatchesScreen} />
      <Stack.Screen name="JobMatchDetails" component={JobMatchDetailsScreen} />
      <Stack.Screen name="JobAwaitingApproval" component={JobAwaitingApprovalScreen} />
      <Stack.Screen name="JobAwaitingApprovalDetails" component={JobAwaitingApprovalDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="ReviewInvitation" component={ReviewInvitationScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default ClientAppStack;
