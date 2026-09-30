import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import LogoutPopup from './components/LogoutPopup';
import DeletePopup from './components/DeletePopup';
import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import AppText from '@components/AppText';
import PinInput from '@components/PinInput';
import { useContractorProfileViewModel } from './useContractorProfileViewModel';

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
            style={[styles.itemIcon, activeTintColor ? { tintColor: activeTintColor } : null, width ? { width } : null, height ? { height } : null]}
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

const ProfileScreen = () => {
  const {
    displayName,
    commissionText,
    profileImageSource,
    imageLoading,
    setImageLoading,
    setHasImageError,
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
    handleForgetPinPress,
    userEmail,
    handlePinSettingPress,
    handleOpenSupport,
    navigateToProfileDetails,
    navigateToCertifications,
    navigateToClockOutRequest,
    navigateToBankAccountDetails,
    navigateToRatings,
    navigateToAboutUs,
    navigateToFaq,
    navigateToTerms,
    navigateToPrivacy,
    rateApp,
  } = useContractorProfileViewModel();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <TopHeader title={strings.auth.contractor.profile.screenTitle} hideBackButton />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            <FastImage
              source={profileImageSource}
              style={styles.avatar}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setHasImageError(true);
              }}
            />
          </View>
          <AppText numberOfLines={1} style={styles.userName}>{displayName}</AppText>
          <AppText style={styles.commissionText}>{commissionText}</AppText>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <SectionHeader title={strings.auth.contractor.profile.accountSettings} />
          <SettingItem
            label={strings.auth.contractor.profile.viewProfileDetails}
            icon={require('@assets/images/contractor/profile/userProfile.png')}
            onPress={navigateToProfileDetails}
          />
          <SettingItem
            label={strings.auth.contractor.profile.certifications}
            icon={require('@assets/images/contractor/profile/certificte.png')}
            onPress={navigateToCertifications}
          />
          <SettingItem
            label={strings.auth.contractor.profile.clockOutRequest}
            icon={require('@assets/images/common/blackClock.png')}
            onPress={navigateToClockOutRequest}
            tintColor={colors.primary}
            width={horizontalScale(20)}
            height={horizontalScale(20)}
          />
          <SettingItem
            label={strings.auth.contractor.profile.bankAccountDetails}
            icon={require('@assets/images/contractor/profile/bankAccount.png')}
            onPress={navigateToBankAccountDetails}
          />
          <SettingItem
            label={strings.auth.contractor.profile.ratings}
            icon={require('@assets/images/contractor/profile/ratings.png')}
            onPress={navigateToRatings}
          />
          <SettingItem
            label={
              isPinSetFully
                ? strings.auth.contractor.profile.resetTransactionPin
                : strings.auth.contractor.profile.createTransactionPin
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
              label={strings.auth.contractor.profile.forgetTransactionPin}
              icon={require('@assets/images/common/forget.png')}
              onPress={handleForgetPinPress}
            />
          )}
          <SettingItem
            label={strings.auth.contractor.profile.notification}
            icon={require('@assets/images/contractor/profile/notification.png')}
            hasSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={handleNotificationToggle}
            disabled={notificationLoading}
          />
        </View>

        {/* Application Settings Section */}
        <View style={styles.section}>
          <SectionHeader title={strings.auth.contractor.profile.applicationSettings} />
          <SettingItem
            label={strings.auth.contractor.profile.aboutUs}
            icon={require('@assets/images/contractor/profile/aboutUs.png')}
            onPress={navigateToAboutUs}
          />
          <SettingItem
            label={strings.auth.contractor.profile.faq}
            icon={require('@assets/images/contractor/profile/faq.png')}
            onPress={navigateToFaq}
          />
          <SettingItem
            label={strings.auth.contractor.profile.rateTheApp}
            icon={require('@assets/images/contractor/profile/rateTheApp.png')}
            onPress={rateApp}
          />

          <SettingItem
            label={strings.auth.contractor.profile.support}
            icon={require('@assets/images/contractor/profile/support.png')}
            onPress={handleOpenSupport}
          />
          <SettingItem
            label={strings.common.termsOfService}
            icon={require('@assets/images/contractor/profile/termsOfService.png')}
            onPress={navigateToTerms}
          />
          <SettingItem
            label={strings.common.privacyPolicy}
            icon={require('@assets/images/contractor/profile/privacyPolicy.png')}
            onPress={navigateToPrivacy}
          />
        </View>

        {/* Footer Buttons */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => setDeleteVisible(true)}
          >
            <Image
              source={require('@assets/images/contractor/profile/deletIcon.png')}
              style={[styles.footerBtnIcon, { tintColor: colors.red }]}
            />
            <AppText style={[styles.footerBtnText, { color: colors.red }]}>{strings.auth.contractor.profile.deleteAccount}</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => setLogoutVisible(true)}
          >
            <Image
              source={require('@assets/images/contractor/profile/logout.png')}
              style={[styles.footerBtnIcon, { tintColor: colors.primary }]}
            />
            <AppText style={[styles.footerBtnText, { color: colors.primary }]}>{strings.common.logout}</AppText>
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
        headerTitle={strings.auth.contractor.profile.createTransactionPin}
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
        headerTitle={strings.auth.contractor.profile.resetTransactionPin}
        error={changePinError}
        samePinError={strings.transactionPin.samePinError}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
    height: verticalScale(56),
    marginTop: verticalScale(10),
  },
  headerTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
    paddingHorizontal: horizontalScale(20),
  },
  userInfoSection: {
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(30),
  },
  avatarContainer: {
    width: horizontalScale(100),
    height: horizontalScale(100),
    borderRadius: horizontalScale(50),
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: horizontalScale(50),
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  userName: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: verticalScale(4),
  },
  commissionText: {
    fontSize: fontSize(12),
    color: colors.textSecondary,
    fontFamily: fonts.medium,
  },

  section: {
    marginBottom: verticalScale(12),
  },
  sectionHeader: {
    fontSize: fontSize(16),
    fontFamily: fonts.medium,
    color: colors.black,
    marginBottom: verticalScale(16),
  },
  settingItem: {
    height: verticalScale(60),
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: colors.statBorder,
    paddingHorizontal: horizontalScale(16),
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: horizontalScale(36),
    height: horizontalScale(36),
    backgroundColor: colors.lightPurple,
    borderRadius: horizontalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  itemIcon: {
    width: horizontalScale(34),
    height: horizontalScale(34),
  },
  settingText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.black,
  },
  chevron: {
    width: horizontalScale(20),
    height: horizontalScale(20),
    tintColor: colors.gray,
    transform: [{ rotate: '180deg' }],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(80),
  },
  footerButton: {
    width: '48%',
    height: verticalScale(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: horizontalScale(12),
    borderWidth: 1,
    borderColor: colors.statBorder,
  },
  footerBtnIcon: {
    width: horizontalScale(18),
    height: horizontalScale(18),
    marginRight: horizontalScale(10),
  },
  footerBtnText: {
    fontSize: fontSize(14),
    fontFamily: fonts.medium,
  },
});

export default ProfileScreen;
