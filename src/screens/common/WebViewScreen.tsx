import React from 'react';
import { StyleSheet, ActivityIndicator, View, StatusBar, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import TopHeader from '@components/TopHeader';
import AppText from '@components/AppText';
import colors from '@styles/colors';

type WebViewRouteProp = RouteProp<{ WebView: { url: string; title?: string } }, 'WebView'>;

const WebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<WebViewRouteProp>();
  const { url = '', title = '' } = route.params || {};

  // Guard against missing, empty or non-string URL to prevent WebView native crash
  if (!url || typeof url !== 'string' || !url.trim()) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <TopHeader 
          title={title || 'Document'} 
          onBack={() => navigation.goBack()} 
        />
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>Invalid or missing URL.</AppText>
        </View>
      </View>
    );
  }

  const safeUrl = url.trim();

  // Check if it's a document format that Android WebView can't render natively
  const isDocument = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx)(\?.*)?$/i.test(safeUrl);
  
  // Route Android documents through Google Docs Viewer, otherwise load directly
  const displayUrl = (Platform.OS === 'android' && isDocument) 
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(safeUrl)}` 
    : safeUrl;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopHeader 
        title={title || 'Document'} 
        onBack={() => navigation.goBack()} 
      />
      <WebView
        source={{ uri: displayUrl }}
        style={styles.webview}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={(request) => {
          if (!request || !request.url) return false;

          // Handle non-http/https schemes safely (tel, mailto, whatsapp, etc.)
          if (!/^https?:\/\//i.test(request.url)) {
            Linking.canOpenURL(request.url)
              .then(supported => {
                if (supported) Linking.openURL(request.url);
              })
              .catch(() => {});
            return false;
          }

          return true;
        }}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        renderError={() => (
          <View style={styles.errorContainer}>
            <AppText style={styles.errorText}>Failed to load webpage.</AppText>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
});

export default WebViewScreen;
