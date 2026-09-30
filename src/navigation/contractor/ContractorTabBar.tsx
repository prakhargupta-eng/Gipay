import React from 'react';
import { View, StyleSheet, Pressable, Dimensions, Image, Platform } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import RNLinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import HomeScreen from '@screens/contractor/tabview/home/homeScreen/index';
import MainJobsScreen from '@screens/contractor/tabview/jobs/index';
import ProfileScreen from '@screens/contractor/tabview/profile/ProfileScreen';
import MatchesScreen from '@screens/contractor/tabview/matches';
import WalletScreen from '@screens/contractor/tabview/wallet';
import { useUserStore } from '@store/useUserStore';
import strings from '@constants/strings';
import AppText from '@components/AppText';

const { width, height } = Dimensions.get('window');
const TAB_WIDTH = width / 5;
const CURVE_WIDTH = 35; // half-width of the notch curve
const NOTCH_DEPTH = 32; // how deep the curve dips
const isSmallDevice = height < 700;
// ─── Tab Icon Images ──────────────────────────────────────────────────
const TAB_ICONS = {
    home: require('@assets/images/contractor/contractorTabIcon/home.png'),
    guards: require('@assets/images/contractor/contractorTabIcon/user.png'),
    jobs: require('@assets/images/contractor/contractorTabIcon/breafcase.png'),
    payments: require('@assets/images/contractor/contractorTabIcon/match.png'),
    account: require('@assets/images/contractor/contractorTabIcon/wallet.png'),
};

type TabIconKey = keyof typeof TAB_ICONS;

// Tab configuration
const TABS: { name: string; iconKey: TabIconKey }[] = [
    { name: strings.tabs.home, iconKey: 'home' },
    { name: strings.tabs.jobs, iconKey: 'jobs' },
    { name: strings.tabs.matches, iconKey: 'payments' },
    { name: strings.tabs.wallet, iconKey: 'account' },
    { name: strings.tabs.profile, iconKey: 'guards' },
];

// Generate smooth notch path for the tab bar
const getTabBarPath = (activeIndex: number): string => {
    const centerX = activeIndex * TAB_WIDTH + TAB_WIDTH / 2;
    const curveStart = centerX - CURVE_WIDTH;
    const curveEnd = centerX + CURVE_WIDTH;
    const barTop = 5;
    const dip = barTop + NOTCH_DEPTH;

    return [
        `M0,${barTop}`,
        `L${curveStart - 20},${barTop}`,
        // Smooth curve down
        `C${curveStart},${barTop} ${curveStart + 5},${dip} ${centerX},${dip}`,
        // Smooth curve up
        `C${curveEnd - 5},${dip} ${curveEnd},${barTop} ${curveEnd + 20},${barTop}`,
        `L${width},${barTop}`,
        `L${width},${Platform.OS === 'ios' ? (isSmallDevice ? 70 : 95) : 70}`,
        `L0,${Platform.OS === 'ios' ? (isSmallDevice ? 70 : 95) : 70}`,
        'Z',
    ].join(' ');
};

// ─── Component ──────────────────────────────────────────────────────────
const ContractorTabBar = () => {
    const { contractorTabIndex, setContractorTabIndex } = useUserStore();
    const animationValue = useSharedValue(contractorTabIndex);

    React.useEffect(() => {
        animationValue.value = contractorTabIndex;
    }, [contractorTabIndex]);

    // Animated style for the floating circle
    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withSpring(
                        animationValue.value * TAB_WIDTH + TAB_WIDTH / 2 - 28,
                        { damping: 30, stiffness: 90 }
                    ),
                },
            ],
        };
    });

    // Render the active screen content
    const renderScreen = () => {
        switch (contractorTabIndex) {
            case 0:
                return <HomeScreen />;
            case 1:
                return <MainJobsScreen />;
            case 2:
                return <MatchesScreen />;
            case 3:
                return <WalletScreen />;
            case 4:
                return <ProfileScreen />;
            default:
                return <HomeScreen />;
        }
    };

    return (
        <View style={styles.root}>
            {/* Screen Content */}
            {renderScreen()}

            {/* Tab Bar */}
            <View style={styles.wrapper}>
                {/* Background SVG with smooth notch curve */}
                <View style={styles.svgContainer}>
                    <Svg width={width} height={Platform.OS === 'ios' ? (isSmallDevice ? 70 : 90) : 70} viewBox={`0 0 ${width} ${Platform.OS === 'ios' ? (isSmallDevice ? 70 : 90) : 70}`}>
                        <Defs>
                            <LinearGradient id="tabGradient" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor="#3B1080" />
                                <Stop offset="1" stopColor="#1E0EA5" />
                            </LinearGradient>
                        </Defs>
                        <Path fill="url(#tabGradient)" d={getTabBarPath(contractorTabIndex)} />
                    </Svg>
                </View>

                {/* Floating Active Circle */}
                <Animated.View style={[styles.activeCircle, animatedCircleStyle]}>
                    <RNLinearGradient
                        colors={['#3B1080', '#1E0EA5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.activeCircleGradient}
                    >
                        <Image
                            source={TAB_ICONS[TABS[contractorTabIndex].iconKey]}
                            style={styles.activeIcon}
                            resizeMode="contain"
                        />
                    </RNLinearGradient>
                </Animated.View>

                {/* Tab Icons and Text */}
                <View style={styles.container}>
                    {TABS.map((tab, index) => {
                        const isActive = contractorTabIndex === index;
                        return (
                            <Pressable
                                key={index}
                                style={styles.tabItem}
                                onPress={() => {
                                    setContractorTabIndex(index);
                                }}
                            >
                                {!isActive && (
                                    <Image
                                        source={TAB_ICONS[tab.iconKey]}
                                        style={styles.inactiveIcon}
                                        resizeMode="contain"
                                    />
                                )}
                                {isActive && (
                                    <AppText style={styles.activeText}>{tab.name}</AppText>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    wrapper: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: Platform.OS === 'ios' ? (isSmallDevice ? 80 : 110) : 80,
        backgroundColor: 'transparent',
    },
    svgContainer: {
        position: 'absolute',
        bottom: 0,
    },
    container: {
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? (isSmallDevice ? 56 : 86) : 56,
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    inactiveIcon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
        opacity: 0.85,
    },
    activeIcon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
    },
    activeCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        position: 'absolute',
        top: -14,
        elevation: 6,
        shadowColor: '#3B1080',
        overflow: 'hidden',
    },
    activeCircleGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
        marginTop: 20,
    },
});

export default ContractorTabBar;
