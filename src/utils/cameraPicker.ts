import { Alert, Linking, Platform, PermissionsAndroid, Permission } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

export interface CapturedImage {
  uri: string;
  name: string | null;
  type: string | null;
  size?: number;
}

const requestAndroidCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const isApi33 = (Platform.Version as number) >= 33;
    const isApi30 = (Platform.Version as number) >= 30;

    const permissionsToRequest: Permission[] = [PermissionsAndroid.PERMISSIONS.CAMERA];

    if (isApi33) {
      permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
    } else {
      permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      if (!isApi30) {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      }
    }

    const status = await Promise.all(
      permissionsToRequest.map(p => PermissionsAndroid.check(p))
    );

    const missingPermissions = permissionsToRequest.filter((_, i) => !status[i]);

    if (missingPermissions.length === 0) return true;

    const result = await PermissionsAndroid.requestMultiple(missingPermissions);

    const allGranted = permissionsToRequest.every(p => 
      result[p] === PermissionsAndroid.RESULTS.GRANTED || 
      (!missingPermissions.includes(p))
    );

    if (allGranted) {
      return true;
    }

    showPermissionDeniedAlert();
    return false;
  } catch (err) {
    console.error('Permission Request Error:', err);
    return false;
  }
};

const showPermissionDeniedAlert = () => {
  Alert.alert(
    'Permission Required',
    'Camera access is required for selfie verification. Please enable it in Settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() }
    ]
  );
};

export const pickImageFromGallery = async (): Promise<CapturedImage | null> => {
  if (Platform.OS === 'android') {
    const hasPermission = await requestAndroidCameraPermission();
    if (!hasPermission) return null;
  }

  try {
    const image = await ImagePicker.openPicker({
      cropping: true,
      forceJpg: true,
    });

    const SUPPORTED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/heic',
      'image/heif',
    ];

    if (!SUPPORTED_TYPES.includes(image.mime)) {
      Alert.alert(
        'Unsupported Image',
        'Please select a JPG, PNG, or HEIC image.'
      );
      return null;
    }

    return {
      uri: image.path,
      name: image.filename || 'profile.jpg',
      type: image.mime,
      size: image.size,
    };
  } catch (err: any) {
    if (err.code !== 'E_PICKER_CANCELLED') {
      console.error('Gallery Error:', err);
      Alert.alert('Error', 'Failed to open gallery.');
    }
    return null;
  }
};

export const showImagePickerOptions = async (onImagePicked: (image: CapturedImage) => void) => {
  const image = await pickImageFromGallery();
  if (image) onImagePicked(image);
};

