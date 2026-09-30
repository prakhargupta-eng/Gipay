import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '@styles/colors';
import strings from '@strings';
import TopHederScreen from '@components/TopHeader';
import Config from 'react-native-config';


// TODO: Replace with your actual Google Maps API Key
const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY || '';

const LocationSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const inputRef = useRef<any>(null);

  useEffect(() => {
    // Auto focus the search input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBack = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TopHederScreen title={strings.locationSearch.screenTitle} onBack={handleBack} />

      <View style={styles.content}>
        <GooglePlacesAutocomplete
          ref={inputRef}
          placeholder={strings.locationSearch.placeholder}
          minLength={2}
          fetchDetails={true}
          textInputProps={{
            autoFocus: true,
            placeholderTextColor: '#9CA3AF',
          }}
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            const locationName = data.description;
            const lat = details?.geometry.location.lat;
            const lng = details?.geometry.location.lng;
            const { onSelectLocation } = route.params || {};
            if (onSelectLocation) {
              onSelectLocation(locationName, lat, lng);
              navigation.goBack();
            } else {
              navigation.navigate('CreateJob', {
                selectedLocation: locationName,
                latitude: lat,
                longitude: lng,
              });
            }
          }}
          isRowScrollable={false}
          numberOfLines={5}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          styles={{
            container: {
              flex: 1,
            },
            textInputContainer: {
              backgroundColor: colors.white,
              borderTopWidth: 0,
              borderBottomWidth: 0,
              paddingHorizontal: 20,
              paddingBottom: 10,
            },
            textInput: {
              height: 50,
              color: colors.black,
              fontSize: 16,
              backgroundColor: '#F5F7F9',
              borderRadius: 12,
              paddingHorizontal: 15,
              borderWidth: 1,
              borderColor: '#E1E8ED',
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
            listView: {
              paddingHorizontal: 20,
            },
            row: {
              backgroundColor: colors.white,
              paddingVertical: 14,
              paddingHorizontal: 4,
              minHeight: 55,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#F0F0F0',
            },
            description: {
              fontSize: 15,
              color: colors.black,
              flex: 1,
              flexWrap: 'wrap',
              lineHeight: 20,
            },
          }}
          enablePoweredByContainer={false}
          nearbyPlacesAPI="GooglePlacesSearch"
          debounce={400}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  content: {
    flex: 1,
  },
});

export default LocationSearchScreen;
