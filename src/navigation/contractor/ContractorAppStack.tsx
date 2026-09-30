import React, { useEffect, useState, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import LocationPermissionModal from '@components/LocationPermissionModal';
import ContractorTabBar from './ContractorTabBar';
import DiscoverJobsScreen from '@screens/contractor/tabview/home/discover/DiscoverJobs';
import JobDetailsScreen from '@screens/contractor/tabview/home/discover/JobDetails';
import MyJobDetailsScreen from '@screens/contractor/tabview/jobs/details';
import DisputeHistoryScreen from '@screens/contractor/tabview/home/DisputeHistory';
import DisputeDetailsScreen from '@screens/contractor/tabview/home/DisputeHistory/DisputeDetails';
import BankAccountDetailsScreen from '@screens/contractor/tabview/profile/addBankAccount/BankAccountDetailsScreen';
import AddBankAccountScreen from '@screens/common/AddBankAccount';
import RatingsScreen from '@screens/contractor/tabview/profile/Rating/RatingsScreen';
import FAQScreen from '@screens/common/FAQScreen';
import ProfileDetailsScreen from '@screens/contractor/tabview/profile/ProfileDetails';
import CertificationsScreen from '@screens/contractor/tabview/profile/Certifications/CertificationsScreen';
import AttendanceDetailsScreen from '@screens/client/tabview/jobs/common/AttendanceDetails/AttendanceDetailsScreen';
import PaymentDetailsScreen from '@screens/client/tabview/jobs/common/PaymentDetails/PaymentDetailsScreen';
import ContractorOTPScreen from '@screens/contractor/auth/otp/ContractorOTPScreen';
import WebViewScreen from '@screens/common/WebViewScreen';
import ForgetTransactionPinScreen from '@screens/common/ForgetTransactionPinModal';
import VerifyCodeScreen from '@screens/contractor/auth/forgotPassword/verify/VerifyCodeScreen';
import JobInvitationsScreen from '@screens/contractor/tabview/home/invitations';
import InvitationDetailsScreen from '@screens/contractor/tabview/home/invitations/InvitationDetails';
import MatchesDetailsScreen from '@screens/contractor/tabview/matches/MatchesDetails';
import WalletScreen from '@screens/contractor/tabview/wallet';
import ViewEarningScreen from '@screens/contractor/tabview/wallet/ViewEarning';
import WithdrawAmountScreen from '@screens/contractor/tabview/wallet/WithdrawAmount';
import TransactionHistoryScreen from '@screens/contractor/tabview/wallet/TransactionHistory';
import ContractorTransactionDetailsScreen from '@screens/contractor/tabview/wallet/TransactionDetails';
import NotificationsScreen from '@screens/common/NotificationsScreen';
import ReKycScreen from '@screens/contractor/tabview/profile/ReKyc';
import ChatScreen from '@screens/common/ChatScreen';
import ClockOutRequestScreen from '@screens/contractor/tabview/jobs/ClockOutRequest';

export type ContractorAppStackParamList = {
    ContractorTabs: undefined;
    DiscoverJobs: undefined;
    JobDetails: { jobId: string };
    MyJobDetails: { job?: any; jobId?: string; tab?: string };
    DisputeHistory: undefined;
    DisputeDetails: { disputeId: string; type: 'by' | 'for' };
    AttendanceDetails: { job?: any; jobId?: string; contractorId?: string; commingFromContractore?: boolean };
    PaymentDetails: { job?: any; jobId?: string; contractorId?: string; commingFromContractore?: boolean };
    BankAccountDetails: undefined;
    AddBankAccount: { item?: any, isUpdate?: boolean, isComingFrom: string };
    Ratings: undefined;
    Information: { type: 'privacy' | 'terms' | 'about' };
    FAQ: undefined;
    ProfileDetails: { emailVerified?: boolean; newEmail?: string } | undefined;
    Certifications: undefined;
    ForgetTransactionPin: { email?: string } | undefined;
    ResetTransactionPin: { email?: string } | undefined;
    ContractorOTP: { email: string, otpId?: string, flowType?: 'registration' | 'forgotPassword' | 'profileUpdate', expiresIn?: number };
    verifyCode: {
        email?: string,
        mobile?: string,
        countryCode?: number,
        otpId?: string,
        flowType?: 'registration' | 'forgotPassword' | 'profileUpdate' | 'client' | 'contractor',
        role?: 'client' | 'contractor',
        expiresIn?: number,
    };
    WebView: { url: string; title?: string };
    JobInvitations: undefined;
    InvitationDetails: { jobData: any };
    MatchesDetails: { jobData: any };
    Wallet: undefined;
    ViewEarning: undefined;
    WithdrawAmount: { availableBalance?: number } | undefined;
    TransactionHistory: undefined;
    ContractorTransactionDetails: { txnId: string };
    Notifications: undefined;
    ReKyc: undefined;
    ChatScreen: { recipientName?: string; recipientAvatar?: string; jobId?: string; jobOrderId?: string; jobTitle?: string; isChatDisabled?: boolean; disabled?: boolean } | undefined;
    ClockOutRequest: { jobId?: string } | undefined;
};

const Stack = createNativeStackNavigator<ContractorAppStackParamList>();

const ContractorAppStack = () => {
    const [showLocationModal, setShowLocationModal] = useState(false);
    const appState = useRef(AppState.currentState);

    const checkLocationStatus = async () => {
        const permission = Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

        let status = await check(permission);
        
        if (status !== RESULTS.GRANTED) {
            status = await request(permission);
            if (status !== RESULTS.GRANTED) {
                setShowLocationModal(true);
            } else {
                setShowLocationModal(false);
            }
        } else {
            setShowLocationModal(false);
        }
    };

    useEffect(() => {
        // Initial check on mount
        checkLocationStatus();

        // Check on app state changes
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                checkLocationStatus();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <>
            <Stack.Navigator screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}>
                <Stack.Screen name="ContractorTabs" component={ContractorTabBar} />
                <Stack.Screen name="DiscoverJobs" component={DiscoverJobsScreen} />
                <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
                <Stack.Screen name="MyJobDetails" component={MyJobDetailsScreen} />
                <Stack.Screen name="DisputeHistory" component={DisputeHistoryScreen} />
                <Stack.Screen name="DisputeDetails" component={DisputeDetailsScreen} />
                <Stack.Screen name="AttendanceDetails" component={AttendanceDetailsScreen} />
                <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
                <Stack.Screen name="BankAccountDetails" component={BankAccountDetailsScreen} />
                <Stack.Screen name="AddBankAccount" component={AddBankAccountScreen} />
                <Stack.Screen name="Ratings" component={RatingsScreen} />
                <Stack.Screen name="FAQ" component={FAQScreen} />
                <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
                <Stack.Screen name="Certifications" component={CertificationsScreen} />
                <Stack.Screen name="ForgetTransactionPin" component={ForgetTransactionPinScreen} />
                <Stack.Screen name="ResetTransactionPin" component={ForgetTransactionPinScreen} />
                <Stack.Screen name="ContractorOTP" component={ContractorOTPScreen} />
                <Stack.Screen name="verifyCode" component={VerifyCodeScreen} />
                <Stack.Screen name="WebView" component={WebViewScreen} />
                <Stack.Screen name="JobInvitations" component={JobInvitationsScreen} />
                <Stack.Screen name="InvitationDetails" component={InvitationDetailsScreen} />
                <Stack.Screen name="MatchesDetails" component={MatchesDetailsScreen} />
                <Stack.Screen name="Wallet" component={WalletScreen} />
                <Stack.Screen name="ViewEarning" component={ViewEarningScreen} />
                <Stack.Screen name="WithdrawAmount" component={WithdrawAmountScreen} />
                <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
                <Stack.Screen name="ContractorTransactionDetails" component={ContractorTransactionDetailsScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="ReKyc" component={ReKycScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="ClockOutRequest" component={ClockOutRequestScreen} />
            </Stack.Navigator>

            <LocationPermissionModal 
                visible={showLocationModal} 
                onOpenSettings={() => Linking.openSettings()} 
            />
        </>
    );
};

export default ContractorAppStack;
