import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import styles from './style';
import ToggleSwitch from '@components/ToggleSwitch';
import CustomButton from '@components/CustomButton';
import strings from '@constants/strings';
import { useAuth } from '@context/AuthContext';
import colors from '@styles/colors';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

const { width } = Dimensions.get('window');

interface GetStartedScreenProps {
    onComplete: (userType: 'client' | 'contractor') => void;
    onCompleteLogin: (userType: 'client' | 'contractor') => void;
}

const GetStartedScreen = ({ onComplete, onCompleteLogin }: GetStartedScreenProps) => {
    const { persistedRole, updatePersistedRole } = useAuth();
    const clientIcon = require('@assets/images/auth/clientIcon.png');
    const contractorIcon = require('@assets/images/auth/contractorIcon.png');

    const [activeUserType, setActiveUserType] = useState<'client' | 'contractor'>(persistedRole || 'client');

    const scrollViewRef = useRef<ScrollView>(null);
    const slideAnim = useRef(new Animated.Value(activeUserType === 'client' ? 0 : 1)).current;

    useEffect(() => {
        // Synchronize ScrollView and Animation state with activeUserType
        const toValue = activeUserType === 'client' ? 0 : 1;

        Animated.spring(slideAnim, {
            toValue,
            useNativeDriver: true,
            bounciness: 0,
        }).start();

        scrollViewRef.current?.scrollTo({
            x: activeUserType === 'client' ? 0 : width,
            animated: true,
        });
    }, [activeUserType]);

    const titleTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -width],
    });

    const handleCreateAccount = () => {
        devDebugger.log('activeUserType', activeUserType);
        onComplete(activeUserType);
    };

    const handleLoginAccount = () => {
        onCompleteLogin(activeUserType);
    };

    const onToggleSelect = (value: string) => {
        const selectedType = value === strings.auth.getStarted.clientOption ? 'client' : 'contractor';
        setActiveUserType(selectedType);
        updatePersistedRole(selectedType);
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Background Image Swiper */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                style={styles.backgroundScrollView}
            >
                <View style={styles.page}>
                    <Image source={clientIcon} style={styles.bgImage} resizeMode="cover" />
                </View>
                <View style={styles.page}>
                    <Image source={contractorIcon} style={styles.bgImage} resizeMode="cover" />
                </View>
            </ScrollView>

            <View style={styles.overlay}>
                <View style={styles.contentContainer}>

                    {/* Animated Titles */}
                    <View style={styles.titleCarouselContainer}>
                        <Animated.View style={[styles.titleRow, { transform: [{ translateX: titleTranslateX }] }]}>
                            <View style={styles.titleWrapper}>
                                <AppText style={styles.headline}>
                                    {strings.auth.getStarted.clientHeadline}
                                </AppText>
                            </View>
                            <View style={styles.titleWrapper}>
                                <AppText style={styles.headline}>
                                    {strings.auth.getStarted.contractorHeadline}
                                </AppText>
                            </View>
                        </Animated.View>
                    </View>

                    <ToggleSwitch
                        options={[strings.auth.getStarted.clientOption, strings.auth.getStarted.contractorOption]}
                        initialOption={activeUserType === 'client' ? strings.auth.getStarted.clientOption : strings.auth.getStarted.contractorOption}
                        onSelect={onToggleSelect}
                    />

                    <View style={styles.button}>
                        <CustomButton
                            title={strings.auth.getStarted.createAccount}
                            onPress={handleCreateAccount}
                            gradientColors={[colors.green, colors.green]}

                        />
                    </View>

                    <View style={styles.footer}>
                        <AppText style={styles.footerText}>{strings.common.alreadyHaveAccount}</AppText>
                        <TouchableOpacity onPress={handleLoginAccount}>
                            <AppText style={styles.loginText}>{strings.common.logIn}</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default GetStartedScreen;