import React, { useState, useRef } from 'react';
import CustomToast from '@components/CustomToast';
import {
  Modal,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import colors from '@styles/colors';
import fonts from '@assets/Fonts';
import { horizontalScale, verticalScale, fontSize } from '@styles/mixins';
import CustomButton from '@components/CustomButton';
import AppText from '@components/AppText';
import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';

interface RateClientModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  jobId?: string;
}

const CATEGORY_GROUPS = [
  {
    title: 'Overall Work Performance',
    tags: ['Quality', 'Accuracy', 'Professionalism']
  },
  {
    title: 'Timeliness',
    tags: ['Deadlines', 'Reliability', 'Responsiveness']
  },
  {
    title: 'Communication',
    tags: ['Clarity', 'Collaboration', 'Responsiveness']
  }
];

const RATING_TEXT: Record<number, string> = {
  5: 'Excellent',
  4: 'Good',
  3: 'Average',
  2: 'Poor',
  1: 'Unacceptable',
};

const RateClientModal: React.FC<RateClientModalProps> = ({
  visible,
  onClose,
  onSubmit,
  jobId,
}) => {
  const [rating, setRating] = useState(0);
  const toastRef = useRef<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<{key: string, tag: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal is closed
  React.useEffect(() => {
    if (!visible) {
      setRating(0);
      setSelectedCategories([]);
      setIsLoading(false);
    }
  }, [visible]);

  const toggleCategory = (key: string, tag: string) => {
    setSelectedCategories(prev => {
      const exists = prev.find(item => item.key === key);
      if (exists) {
        return prev.filter(item => item.key !== key);
      } else {
        return [...prev, { key, tag }];
      }
    });
  };

  const handleClose = () => {
    setRating(0);
    setSelectedCategories([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!jobId) return;

    setIsLoading(true);
    try {
      const payload = {
        stars: rating,
        categories: Array.from(new Set(selectedCategories.map(item => item.tag)))
      };
      const response = await JobService.rateClient(jobId, payload);
      if (response.success) {
        onSubmit(rating);
        handleClose();
        setTimeout(() => {
          Toast.show({ type: 'success', text2: 'Rating submitted successfully' });
        }, 300);
      } else {
        toastRef.current?.show({ type: 'error', text2: response.message || 'Failed to submit rating' });
      }
    } catch (error: any) {
      toastRef.current?.show({ 
        type: 'error', 
        text2: error?.response?.data?.message || error.message || 'Something went wrong' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.spacer} />
            <AppText style={styles.title}>Rate a Client</AppText>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} disabled={isLoading}>
              <Image 
                source={require('@assets/images/common/closeIcon.png')} 
                style={styles.closeIcon} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <AppText style={styles.sectionTitle}>Select Ratings</AppText>
            
            {/* Stars Row */}
            <View style={styles.starsWrapper}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                    disabled={isLoading}
                  >
                    <Image
                      source={require('@assets/images/common/star.png')}
                      style={[
                        styles.starIcon,
                        star <= rating ? styles.starFilled : styles.starEmpty
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <AppText style={styles.ratingText}>({RATING_TEXT[rating]})</AppText>
              )}
            </View>

            <AppText style={styles.categoriesTitle}>Categories</AppText>

            {CATEGORY_GROUPS.map((group, index) => (
              <View key={index} style={styles.groupContainer}>
                <AppText style={styles.groupTitle}>{group.title}</AppText>
                <View style={styles.tagsContainer}>
                  {group.tags.map((tag, tagIndex) => {
                    // For uniqueness, some tags might appear multiple times in the array so we use tag+index as key. 
                    // However they act as the same tag string.
                    const uniqueKey = `${index}-${tagIndex}`;
                    const isSelected = selectedCategories.some(item => item.key === uniqueKey);
                    return (
                      <TouchableOpacity
                        key={uniqueKey}
                        style={[
                          styles.tagBtn,
                          isSelected && styles.tagBtnSelected
                        ]}
                        onPress={() => toggleCategory(uniqueKey, tag)}
                        disabled={isLoading}
                      >
                        <AppText style={[
                          styles.tagText,
                          isSelected && styles.tagTextSelected
                        ]}>
                          {tag}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <CustomButton 
              title="Submit" 
              onPress={handleSubmit}
              disabled={rating === 0 || isLoading}
              loading={isLoading}
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </View>
      <CustomToast ref={toastRef} />
</Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  container: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.white,
    borderRadius: horizontalScale(16),
    paddingTop: verticalScale(20),
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
  },
  spacer: {
    width: horizontalScale(24),
  },
  title: {
    fontSize: fontSize(18),
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  closeBtn: {
    padding: 4,
  },
  closeIcon: {
    width: horizontalScale(24),
    height: horizontalScale(24),
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginBottom: verticalScale(14),
  },
  starsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  starsRow: {
    flexDirection: 'row',
    gap: horizontalScale(4),
  },
  starIcon: {
    width: horizontalScale(32),
    height: horizontalScale(32),
    resizeMode: 'contain',
  },
  starFilled: {
    tintColor: '#FFC107',
  },
  starEmpty: {
    tintColor: '#E5E7EB',
  },
  ratingText: {
    marginLeft: horizontalScale(12),
    fontSize: fontSize(14),
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
  categoriesTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.semiBold,
    color: colors.black,
    marginBottom: verticalScale(16),
  },
  groupContainer: {
    marginBottom: verticalScale(20),
  },
  groupTitle: {
    fontSize: fontSize(15),
    fontFamily: fonts.medium,
    color: colors.black,
    marginBottom: verticalScale(12),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
  },
  tagBtn: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(12),
    borderRadius: horizontalScale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
  },
  tagBtnSelected: {
    borderColor: '#190497', // Or colors.primary, but using a darker blue to match the screenshot if colors.primary isn't right. I'll stick to colors.primary to be safe, but wait, the screenshot has a very dark blue. I will use colors.primary as that's the theme standard. Let me just use colors.primary.
  },
  tagText: {
    fontSize: fontSize(13),
    fontFamily: fonts.medium,
    color: colors.black,
  },
  tagTextSelected: {
    color: '#190497',
  },
  submitBtn: {
    marginTop: verticalScale(16),
    width: '100%',
    backgroundColor: '#190497',
  },
});

export default RateClientModal;
