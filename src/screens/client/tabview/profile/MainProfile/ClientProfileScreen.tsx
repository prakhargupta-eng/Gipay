import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import colors from '@colors';
import strings from '@strings';
import LogoutPopup from '@screens/contractor/tabview/profile/components/LogoutPopup';
import DeletePopup from '@screens/contractor/tabview/profile/components/DeletePopup';
import TopHeader from '@components/TopHeader';
import PinInput from '@components/PinInput';
import styles from './styles';
import AppText from '@components/AppText';
import { verticalScale } from '@styles/mixins';
import { useClientProfileViewModel } from './useClientProfileViewModel';

// ─── Sub-Components ──────────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
  <AppText style={styles.sectionHeader}>{title}</AppText>
);

const SettingItem = ({
  label,
  icon,
  onPress,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
  disabled = false,
  tintColour,
  tintColor = tintColour,
  width,
  height
}: {
  label: string;
  icon: any;
  onPress?: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  disabled?: boolean;
  tintColour?: string;
  tintColor?: string;
  width?: number;
  height?: number;
}) => {
  const switchScale = verticalScale(1);
  const activeTintColor = tintColour || tintColor;
  return (
    <TouchableOpacity
      style={[styles.settingItem, disabled && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={disabled || hasSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Image
            source={icon}
            style={[
              styles.itemIcon,
              activeTintColor ? { tintColor: activeTintColor } : null,
              width ? { width } : null,
              height ? { height } : null
            ]}
            resizeMode="contain"
          />
        </View>
        <AppText style={styles.settingText}>{label}</AppText>
      </View>

      {hasSwitch ? (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Switch
            trackColor={{ false: '#e5e5ea', true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : colors.white}
            ios_backgroundColor="#e5e5ea"
            onValueChange={onSwitchChange}
            value={switchValue}
            disabled={disabled}
            style={Platform.OS === 'ios' ? { width: 51, height: 31, transform: [{ scaleX: switchScale }, { scaleY: switchScale }] } : undefined}
          />
        </View>
      ) : (
        <Image
          source={require('@assets/images/common/backIcon.png')}
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
  );
};

// ─── Main View ────────────────────────────────────────────────────────

const ClientProfileScreen = () => {
  const {
    displayName,
    profileImageUrl,
    imageLoading,
    imageError,
    setImageLoading,
    setImageError,
    notificationsEnabled,
    notificationLoading,
    handleNotificationToggle,
    logoutVisible,
    setLogoutVisible,
    deleteVisible,
    setDeleteVisible,
    isPinSetFully,
    showSetPinModal,
    setShowSetPinModal,
    isSettingPin,
    setPinError,
    setSetPinError,
    handleSetPinComplete,
    showChangePinModal,
    setShowChangePinModal,
    isChangingPin,
    changePinError,
    setChangePinError,
    handleChangePinComplete,
    handleResetPinPress,
    userEmail,
    handlePinSettingPress,
    handleOpenSupport,
    navigateToProfileDetails,
    navigateToRatings,
    navigateToDrafts,
    navigateToPaymentMethod,
    navigateToChangePassword,
    navigateToAboutUs,
    navigateToFaq,
    navigateToTerms,
    navigateToPrivacy,
    rateApp,
  } = useClientProfileViewModel();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <TopHeader title={strings.client.profile.screenTitle} hideBackButton />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            {profileImageUrl && !imageError ? (
              <View style={{ flex: 1, width: '100%', height: '100%' }}>
                <FastImage
                  source={{ uri: profileImageUrl }}
                  style={styles.avatar}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
                {imageLoading && (
                  <ActivityIndicator
                    style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
                    color={colors.primary}
                  />
                )}
              </View>
            ) : (
              <Image
                source={require('@assets/images/contractor/profile/userProfile.png')}
                style={styles.avatar}
              />
            )}
          </View>
          <AppText style={styles.userName}>{displayName}</AppText>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <SectionHeader title={strings.client.profile.accountSettings} />
          <SettingItem
            label={strings.client.profile.viewProfileDetails}
            icon={require('@assets/images/contractor/profile/userProfile.png')}
            onPress={navigateToProfileDetails}
          />
          <SettingItem
            label={strings.client.profile.ratings}
            icon={require('@assets/images/contractor/profile/ratings.png')}
            onPress={navigateToRatings}
          />
          <SettingItem
            label={strings.client.drafts.screenTitle}
            icon={require('@assets/images/client/draft.png')}
            onPress={navigateToDrafts}
          />
          <SettingItem
            label={strings.client.profile.paymentMethods}
            icon={require('@assets/images/client/payment1.png')}
            onPress={navigateToPaymentMethod}
          />
          <SettingItem
            label={strings.client.profile.changePassword}
            icon={require('@assets/images/common/lock.png')}
            onPress={navigateToChangePassword}
          />
          <SettingItem
            label={
              isPinSetFully
                ? strings.client.profile.resetTransactionPin
                : strings.client.profile.createTransactionPin
            }
            icon={
              isPinSetFully
                ? require('@assets/images/common/reset.png')
                : require('@assets/images/common/create.png')
            }
            onPress={handlePinSettingPress}
          />
          {isPinSetFully && (
            <SettingItem
              label={strings.client.profile.forgetTransactionPin}
              icon={require('@assets/images/common/forget.png')}
              onPress={handleResetPinPress}
            />
          )}
          <SettingItem
            label={strings.client.profile.notification}
            icon={require('@assets/images/contractor/profile/notification.png')}
            hasSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={handleNotificationToggle}
            disabled={notificationLoading}
          />
        </View>

        {/* Application Settings Section */}
        <View style={styles.section}>
          <SectionHeader title={strings.client.profile.applicationSettings} />
          <SettingItem
            label={strings.client.profile.aboutUs}
            icon={require('@assets/images/contractor/profile/aboutUs.png')}
            onPress={navigateToAboutUs}
          />
          <SettingItem
            label={strings.auth.contractor.profile.faq}
            icon={require('@assets/images/contractor/profile/faq.png')}
            onPress={navigateToFaq}
          />
          <SettingItem
            label={strings.client.profile.rateTheApp}
            icon={require('@assets/images/contractor/profile/rateTheApp.png')}
            onPress={rateApp}
          />
          <SettingItem
            label={strings.client.profile.support}
            icon={require('@assets/images/contractor/profile/support.png')}
            onPress={handleOpenSupport}
          />
          <SettingItem
            label={strings.client.profile.termsOfService}
            icon={require('@assets/images/contractor/profile/termsOfService.png')}
            onPress={navigateToTerms}
          />
          <SettingItem
            label={strings.client.profile.privacyPolicy}
            icon={require('@assets/images/contractor/profile/privacyPolicy.png')}
            onPress={navigateToPrivacy}

          />
        </View>

        {/* Footer Buttons */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.footerButton} onPress={() => setDeleteVisible(true)}>
            <Image
              source={require('@assets/images/contractor/profile/deletIcon.png')}
              style={[styles.footerBtnIcon, { tintColor: colors.red }]}
            />
            <AppText style={[styles.footerBtnText, { color: colors.red }]}>{strings.client.profile.deleteAccount}</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => setLogoutVisible(true)}
          >
            <Image
              source={require('@assets/images/contractor/profile/logout.png')}
              style={[styles.footerBtnIcon, { tintColor: colors.primary }]}
            />
            <AppText style={[styles.footerBtnText, { color: colors.primary }]}>{strings.client.profile.logout}</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LogoutPopup
        visible={logoutVisible}
        onClose={() => setLogoutVisible(false)}
      />

      <DeletePopup
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
      />

      {/* Create Transaction PIN Modal */}
      <PinInput
        visible={showSetPinModal}
        mode="setup"
        headerTitle={strings.client.profile.createTransactionPin}
        error={setPinError}
        onClose={() => {
          setShowSetPinModal(false);
          setSetPinError(undefined);
        }}
        loading={isSettingPin}
        onComplete={(pin, encryptedPin) => handleSetPinComplete(pin, encryptedPin)}
      />

      {/* Change / Reset Transaction PIN Modal */}
      <PinInput
        visible={showChangePinModal}
        mode="change"
        headerTitle={strings.client.profile.resetTransactionPin}
        error={changePinError}
        samePinError={strings.client.profile.sameTransactionPinError}
        onClose={() => {
          setShowChangePinModal(false);
          setChangePinError(undefined);
        }}
        loading={isChangingPin}
        onChangePinComplete={handleChangePinComplete}
      />
    </View>
  );
};

export default ClientProfileScreen;
