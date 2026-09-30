import React, { useEffect } from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import AppText from '@components/AppText';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import fonts from '@assets/Fonts';

interface JobLocationMapProps {

  destination: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

const JobLocationMap = ({ destination }: JobLocationMapProps) => {
  const mapRef = React.useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && destination) {
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }, 500);
      }, 500);
    }
  }, [destination]);

  return (
    <View
      style={{
        height: verticalScale(220),
        borderRadius: horizontalScale(24),
        overflow: 'hidden',
        marginTop: verticalScale(20),
      }}
    >
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        pointerEvents="none"
        initialRegion={{
          latitude: destination.latitude || 37.7849,
          longitude: destination.longitude || -122.4094,
          latitudeDelta: 0.15,
          longitudeDelta: 0.0121,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        zoomEnabled={false}
        zoomControlEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled={false}
      >


        {/* DESTINATION LOCATION */}
        <Marker
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: horizontalScale(24),
                height: horizontalScale(24),
                borderRadius: horizontalScale(12),
                backgroundColor: '#EF4444',
                borderWidth: horizontalScale(4),
                borderColor: '#ffffff',
              }}
            />
          </View>
        </Marker>

      </MapView>


      {/* RIGHT ADDRESS BOX */}
      <View
        style={{
          position: 'absolute',
          right: horizontalScale(30),
          top: horizontalScale(10),
          backgroundColor: '#fff',
          paddingHorizontal: horizontalScale(14),
          paddingVertical: horizontalScale(10),
          borderRadius: horizontalScale(14),
          width: horizontalScale(200),
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <AppText
          numberOfLines={1}
          style={{
            fontSize: fontSize(15),
            fontFamily: fonts.bold,
            color: '#111827',
          }}
        >
          {destination?.address || 'Job Location'}
        </AppText>

        <AppText
          numberOfLines={1}
          style={{
            fontSize: fontSize(13),
            marginTop: verticalScale(4),
            color: '#6B7280',
          }}
        >
          Destination
        </AppText>
      </View>
    </View>
  );
};

export default JobLocationMap;
