import React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '@components/AppText';
import colors from '@styles/colors';

interface HyperlinkTextProps {
  text?: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  onLinkPress?: (url: string) => void;
}

/**
 * Common function to safely open any web hyperlink in the WebView screen
 */
export const handleOpenLink = (
  navigation: any,
  rawUrl?: any,
  fallbackTitle: string = 'Web Link'
) => {
  try {
    if (!rawUrl || typeof rawUrl !== 'string') return;
    let finalUrl = rawUrl.trim();
    if (!finalUrl) return;

    if (finalUrl.toLowerCase().startsWith('www.')) {
      finalUrl = `https://${finalUrl}`;
    }

    if (!/^https?:\/\//i.test(finalUrl)) {
      return;
    }

    let domainTitle = fallbackTitle;
    try {
      const domainMatch = finalUrl.match(/^https?:\/\/(?:www\.)?([^/]+)/i);
      if (domainMatch && domainMatch[1]) {
        domainTitle = domainMatch[1];
      }
    } catch (e) { }

    navigation.navigate('WebView', {
      url: finalUrl,
      title: domainTitle,
    });
  } catch (e) { }
};

/**
 * Common function to detect URLs in text, highlight them, and attach link press handlers
 */
export const renderDescriptionWithLinks = (
  text?: any,
  onPressUrl?: (url: string) => void,
  linkStyle?: StyleProp<TextStyle>
) => {
  if (!text || typeof text !== 'string') return null;

  try {
    const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+|www\.[^\s<>"'{}|\\^`]+)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (typeof part !== 'string') return null;

      if (/^(https?:\/\/|www\.)/i.test(part)) {
        let cleanUrl = part;
        let trailingPunctuation = '';
        const matchTrailing = cleanUrl.match(/[.,;!?)]+$/);
        if (matchTrailing) {
          trailingPunctuation = matchTrailing[0];
          cleanUrl = cleanUrl.slice(0, -trailingPunctuation.length);
        }

        if (!cleanUrl || cleanUrl.length <= 4) {
          return <AppText key={index}>{part}</AppText>;
        }

        return (
          <React.Fragment key={index}>
            <AppText
              style={[styles.defaultLink, linkStyle]}
              onPress={() => onPressUrl?.(cleanUrl)}
            >
              {cleanUrl}
            </AppText>
            {trailingPunctuation ? (
              <AppText>{trailingPunctuation}</AppText>
            ) : null}
          </React.Fragment>
        );
      }
      return <AppText key={index}>{part}</AppText>;
    });
  } catch (e) {
    return <AppText>{String(text)}</AppText>;
  }
};

/**
 * Common Component: Renders text with automatically detected & clickable hyperlinks
 */
const HyperlinkText: React.FC<HyperlinkTextProps> = ({
  text,
  style,
  linkStyle,
  onLinkPress,
}) => {
  const navigation = useNavigation<any>();

  const handlePress = (url: string) => {
    console.log("fsdfdsfdf", url)
    if (onLinkPress) {
      onLinkPress(url);
    } else {
      handleOpenLink(navigation, url);
    }
  };

  return (
    <AppText style={style}>
      {renderDescriptionWithLinks(text, handlePress, linkStyle)}
    </AppText>
  );
};

const styles = StyleSheet.create({
  defaultLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default HyperlinkText;
