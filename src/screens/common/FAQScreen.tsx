import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import TopHeader from '@components/TopHeader';
import strings from '@constants/strings';
import UtilityService from '@config/utilityService';
import AppText from '@components/AppText';
import { devDebugger } from '@utils/devDebugger';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const AccordionItem = ({ item, isExpanded, onPress }: { item: FAQItem, isExpanded: boolean, onPress: () => void }) => {
    return (
        <View style={styles.accordionContainer}>
            <TouchableOpacity
                style={styles.questionRow}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <AppText style={styles.questionText}>{item.question}</AppText>
                <View style={[styles.iconCircle, isExpanded && styles.iconCircleActive]}>
                    <Image
                        source={require('@assets/images/common/backIcon.png')}
                        style={[
                            styles.chevronIcon,
                            { transform: [{ rotate: isExpanded ? '90deg' : '270deg' }] }
                        ]}
                        resizeMode="contain"
                    />
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.answerContainer}>
                    <AppText style={styles.answerText}>{item.answer}</AppText>
                </View>
            )}
        </View>
    );
};

const FAQScreen = () => {
    const navigation = useNavigation();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [faqs, setFaqs] = useState<FAQItem[]>([]);

    React.useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        setIsLoading(true);
        try {
            const res = await UtilityService.getFaqs();
            if (res.success && res.data) {
                const mappedFaqs = res.data.map((item: any, index: number) => ({
                    ...item,
                    id: item.id || item._id || `faq-${index}`
                }));
                setFaqs(mappedFaqs);
            } 
        } catch (error) {
            devDebugger.log('Error fetching FAQs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <TopHeader
                title={strings.auth.contractor.profile.faq}
                onBack={() => navigation.goBack()}
            />

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <AppText style={styles.description}>
                        Find answers to the most frequently asked questions about the GigPay platform.
                    </AppText>

                    {faqs.map((item) => (
                        <AccordionItem
                            key={item.id}
                            item={item}
                            isExpanded={expandedId === item.id}
                            onPress={() => toggleExpand(item.id)}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(40),
    },
    description: {
        fontSize: fontSize(16),
        fontFamily: fonts.regular,
        color: '#6B7280',
        marginBottom: verticalScale(24),
        lineHeight: verticalScale(24),
    },
    accordionContainer: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        borderWidth: 1,
        borderColor: colors.statBorder,
        marginBottom: verticalScale(16),
        overflow: 'hidden',
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: horizontalScale(16),
        minHeight: verticalScale(64),
    },
    questionText: {
        flex: 1,
        fontSize: fontSize(16),
        fontFamily: fonts.semiBold,
        color: colors.black,
        marginRight: horizontalScale(12),
    },
    iconCircle: {
        width: horizontalScale(32),
        height: horizontalScale(32),
        borderRadius: horizontalScale(16),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircleActive: {
        backgroundColor: colors.primary + '15', // Light primary color
    },
    chevronIcon: {
        width: horizontalScale(14),
        height: horizontalScale(14),
        tintColor: colors.black,
    },
    answerContainer: {
        paddingHorizontal: horizontalScale(16),
        paddingBottom: horizontalScale(16),
        paddingTop: 0,
    },
    answerText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#4B5563',
        lineHeight: verticalScale(22),
    },
});

export default FAQScreen;
