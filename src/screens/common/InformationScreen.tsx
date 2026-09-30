import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import UtilityService from '@config/utilityService';
import TopHeader from '@components/TopHeader';
import { formatDate } from '@utils/dateUtils';
import AppText from '@components/AppText';
import EmptyState from '@components/EmptyState';
import strings from '@constants/strings';
import { devDebugger } from '@utils/devDebugger';

type InfoType = 'privacy' | 'terms' | 'about';

const InformationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { authStatus } = useAuth();
    const { type } = route.params || { type: 'about' };

    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState<any>(null);



    const decodeHtmlEntities = (str: string) => {
        if (!str) return '';
        return str
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/&rsquo;/g, "'")
            .replace(/&lsquo;/g, "'")
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&ndash;/g, '–')
            .replace(/&mdash;/g, '—')
            .replace(/&middot;/g, '•');
    };

    const parseInlineStyles = (text: string, baseStyle: any) => {
        const parts = text.split(/(<[^>]+>)/g);
        
        let isBold = false;
        let isItalic = false;
        let isUnderline = false;
        const elements: React.ReactNode[] = [];
        
        parts.forEach((part, index) => {
            if (part.startsWith('<') && part.endsWith('>')) {
                const tag = part.toLowerCase();
                if (tag === '<strong>' || tag === '<b>') {
                    isBold = true;
                } else if (tag === '</strong>' || tag === '</b>') {
                    isBold = false;
                } else if (tag === '<em>' || tag === '<i>') {
                    isItalic = true;
                } else if (tag === '</em>' || tag === '</i>') {
                    isItalic = false;
                } else if (tag === '<u>') {
                    isUnderline = true;
                } else if (tag === '</u>') {
                    isUnderline = false;
                }
            } else if (part) {
                const style: any = {};
                if (isBold) {
                    style.fontFamily = fonts.bold;
                    style.fontWeight = 'bold';
                }
                if (isItalic) {
                    style.fontStyle = 'italic';
                }
                if (isUnderline) {
                    style.textDecorationLine = 'underline';
                }
                
                elements.push(
                    <AppText key={index} style={style}>
                        {part}
                    </AppText>
                );
            }
        });
        
        return elements;
    };

    const parseHtmlToComponents = (html: string) => {
        if (!html) return null;
        
        const decodedHtml = decodeHtmlEntities(html);

        // Remove structural wrappers so blocks are flat
        const formattedHtml = decodedHtml
            .replace(/<ul[^>]*>/gi, '')
            .replace(/<\/ul>/gi, '')
            .replace(/<ol[^>]*>/gi, '')
            .replace(/<\/ol>/gi, '')
            .replace(/<div[^>]*>/gi, '')
            .replace(/<\/div>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/\r?\n|\r/g, ' ');

        // Split by block tags: p, h1, h2, h3, li
        const blockRegex = /(<(?:p|h1|h2|h3|li)[^>]*>.*?<\/(?:p|h1|h2|h3|li)>)/gi;
        const blocks = formattedHtml.split(blockRegex);
        
        const components: React.ReactNode[] = [];
        
        blocks.forEach((block, index) => {
            const trimmed = block.trim();
            if (!trimmed) return;
            
            const match = block.match(/^<(p|h1|h2|h3|li)[^>]*>(.*?)<\/\1>$/i);
            if (match) {
                const tagName = match[1].toLowerCase();
                const content = match[2];
                
                switch (tagName) {
                    case 'h1':
                        components.push(
                            <AppText key={index} style={styles.h1Text}>
                                {parseInlineStyles(content, styles.h1Text)}
                            </AppText>
                        );
                        break;
                    case 'h2':
                        components.push(
                            <AppText key={index} style={styles.h2Text}>
                                {parseInlineStyles(content, styles.h2Text)}
                            </AppText>
                        );
                        break;
                    case 'h3':
                        components.push(
                            <AppText key={index} style={styles.h3Text}>
                                {parseInlineStyles(content, styles.h3Text)}
                            </AppText>
                        );
                        break;
                    case 'p':
                        components.push(
                            <AppText key={index} style={styles.bodyText}>
                                {parseInlineStyles(content, styles.bodyText)}
                            </AppText>
                        );
                        break;
                    case 'li':
                        components.push(
                            <View key={index} style={styles.listItemRow}>
                                <AppText style={styles.bulletPoint}>•</AppText>
                                <AppText style={styles.listItemText}>
                                    {parseInlineStyles(content, styles.listItemText)}
                                </AppText>
                            </View>
                        );
                        break;
                }
            } else {
                // Render as regular body text with parsed inline styling
                components.push(
                    <AppText key={index} style={styles.bodyText}>
                        {parseInlineStyles(trimmed, styles.bodyText)}
                    </AppText>
                );
            }
        });

        if (components.length === 0) {
            return <AppText style={styles.bodyText}>{stripHtml(html)}</AppText>;
        }

        return components;
    };

    const stripHtml = (html: string) => {
        if (!html) return '';
        const decoded = decodeHtmlEntities(html);
        return decoded
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]*>?/gm, '')
            .trim();
    };

    useEffect(() => {
        fetchContent();
    }, [type]);

    const fetchContent = async () => {
        setIsLoading(true);
        try {
            const slugMap: Record<InfoType, string> = {
                privacy: 'privacy-policy',
                terms: 'terms-and-conditions',
                about: 'about-us'
            };
            const slug = slugMap[type as InfoType] || type;

            const res = await UtilityService.getContent(slug);
            if (res.success && res.data) {
                const data = res.data.results || res.data;
                setContent({
                    title: data.title || getTitlePlaceholder(type),
                    lastUpdated: formatDate(data.updatedAt),
                    body: data.content
                });
            } else {
                setContent(null);
            }
        } catch (error) {
            devDebugger.log('Error fetching content:', error);
            setContent(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getTitlePlaceholder = (t: InfoType) => {
        switch (t) {
            case 'privacy': return 'Privacy Policy';
            case 'terms': return 'Terms of Service';
            case 'about': return 'About Us';
            default: return 'Information';
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        }

        if (!content) {
            return (
                <View style={styles.center}>
                    <EmptyState 
                        title={strings.common.contentNotFound} 
                        description={strings.common.informationUnavailable} 
                    />
                </View>
            );
        }

        return (
            <View style={styles.flex}>
                <View style={styles.titleContainer}>
                    <AppText style={styles.updatedText}>{strings.common.lastUpdated(content.lastUpdated)}</AppText>
                </View>

                <ScrollView
                    style={styles.contentContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    <View style={styles.contentCard}>
                        {parseHtmlToComponents(content.body)}
                    </View>
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <TopHeader
                title={content?.title || getTitlePlaceholder(type)}
                onBack={() => {
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    }
                }}
            />

            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.white,
    },
    flex: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        paddingHorizontal: horizontalScale(20),
        marginTop: verticalScale(10),
        marginBottom: verticalScale(20),
    },
    updatedText: {
        fontSize: fontSize(14),
        fontFamily: fonts.regular,
        color: '#6B7280',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#F3F6FF', // Light blue/grayish background for the content container
        borderTopLeftRadius: horizontalScale(24),
        borderTopRightRadius: horizontalScale(24),
        marginHorizontal: horizontalScale(20)

    },
    scrollContent: {
        padding: horizontalScale(20),
        paddingBottom: verticalScale(40),
    },
    contentCard: {
        backgroundColor: 'transparent',
    },
    bodyText: {
        fontSize: fontSize(16),
        fontFamily: fonts.regular,
        color: '#374151',
        lineHeight: verticalScale(24),
        marginBottom: verticalScale(12),
    },
    h1Text: {
        fontSize: fontSize(22),
        fontFamily: fonts.bold,
        color: colors.black,
        marginTop: verticalScale(16),
        marginBottom: verticalScale(8),
    },
    h2Text: {
        fontSize: fontSize(18),
        fontFamily: fonts.bold,
        color: colors.black,
        marginTop: verticalScale(14),
        marginBottom: verticalScale(6),
    },
    h3Text: {
        fontSize: fontSize(16),
        fontFamily: fonts.bold,
        color: colors.black,
        marginTop: verticalScale(12),
        marginBottom: verticalScale(6),
    },
    listItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: verticalScale(4),
        paddingLeft: horizontalScale(10),
    },
    bulletPoint: {
        fontSize: fontSize(16),
        color: '#374151',
        marginRight: horizontalScale(8),
        lineHeight: verticalScale(22),
    },
    listItemText: {
        flex: 1,
        fontSize: fontSize(16),
        fontFamily: fonts.regular,
        color: '#374151',
        lineHeight: verticalScale(22),
    },
});

export default InformationScreen;
