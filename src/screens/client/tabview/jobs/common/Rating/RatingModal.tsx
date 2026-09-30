import React, { useState , useRef } from 'react';
import CustomToast from '@components/CustomToast';
import {
  View,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import FastImage from 'react-native-fast-image';
import DropdownField from '@components/DropdownField';
import CustomButton from '@components/CustomButton';
import strings from '@constants/strings';
import styles from './styles';
import colors from '@styles/colors';
import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  jobId: string;
  contractorList: any[];
}

const RatingModal: React.FC<RatingModalProps> = ({ visible, onClose, onSubmit, jobId, contractorList }) => {
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const toastRef = useRef<any>(null);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map contractor list for dropdown
  const contractorOptions = contractorList.map(c => ({
    label: c.contractorName || c.name || 'N/A',
    value: c.contractorId || c._id || c.id,
  }));

  // Reset all fields when modal is closed, and handle initial selection when opened
  React.useEffect(() => {
    if (!visible) {
      setSelectedContractorId('');
      setRating(0);
      setSelectedTags([]);
      setIsSubmitting(false);
    } else if (contractorList.length > 0 && !selectedContractorId) {
      const firstId = contractorList[0].contractorId || contractorList[0]._id || contractorList[0].id;
      setSelectedContractorId(firstId);
    }
  }, [visible, contractorList, selectedContractorId]);

  const selectedContractor = contractorList.find(c => (c.contractorId || c._id || c.id) === selectedContractorId);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const renderTag = (tag: string) => {
    const isActive = selectedTags.includes(tag);
    return (
      <TouchableOpacity
        key={tag}
        style={[styles.tag, isActive && styles.activeTag]}
        onPress={() => toggleTag(tag)}
      >
        <AppText style={[styles.tagText, isActive && styles.activeTagText]}>{tag}</AppText>
      </TouchableOpacity>
    );
  };

  const handleSubmit = async () => {
    if (!selectedContractorId) {
      toastRef.current?.show({ type: 'error', text2: 'Please select a contractor' });
      return;
    }
    if (rating === 0) {
      toastRef.current?.show({ type: 'error', text2: 'Please provide a star rating' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        contractorId: selectedContractorId,
        stars: rating,
        categories: selectedTags,
      };

      const response = await JobService.submitRating(jobId, payload);
      if (response.success) {
        Toast.show({ type: 'success', text2: 'Rating submitted successfully' });
        onSubmit?.(payload);
        onClose();
      } else {
        toastRef.current?.show({ type: 'error', text2: response.message || 'Failed to submit rating' });
      }
    } catch (error: any) {
      toastRef.current?.show({ 
        type: 'error', 
        text2: error?.response?.data?.message || error.message || 'Something went wrong' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <AppText style={styles.title}>{strings.client.rating.screenTitle}</AppText>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={isSubmitting}>
              <Image
                source={require('@assets/images/common/closeIcon.png')}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Select Contractor */}
            <DropdownField
              label={strings.client.rating.selectContractor}
              placeholder={strings.client.rating.selectContractor}
              data={contractorOptions}
              value={selectedContractorId}
              onChange={setSelectedContractorId}
              wrapperStyle={{ marginTop: 0 }}
            />

            {/* Contractor Summary Card */}
            {selectedContractor && (
              <View style={styles.contractorCard}>
                <View style={styles.contractorHeader}>
                  <FastImage
                    source={selectedContractor.profileImage ? { uri: selectedContractor.profileImage } : require('@assets/images/common/dummyUser.png')}
                    style={styles.contractorImg}
                  />
                  <View>
                    <AppText style={styles.contractorName}>{selectedContractor.contractorName || selectedContractor.name}</AppText>
                    <AppText style={styles.contractorRole}>Contractor</AppText>
                  </View>
                </View>
              </View>
            )}

            {/* Star Rating */}
            <View style={styles.ratingFilterRow}>
              <AppText style={styles.filterTitle}>{strings.client.rating.selectRatings}</AppText>
              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)} disabled={isSubmitting}>
                      <Image
                        source={require('@assets/images/common/star.png')}
                        style={[styles.starIcon, { width: 28, height: 28, tintColor: star <= rating ? colors.starYellow : colors.border }]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <AppText style={styles.ratingValueText}>
                  {rating > 0 ? `(${rating} ${rating === 1 ? 'Star' : 'Stars'})` : ''}
                </AppText>
              </View>
            </View>

            {/* Categories */}
            <AppText style={styles.categoriesTitle}>{strings.client.rating.categories}</AppText>

            {/* Performance Category */}
            <View style={styles.categorySection}>
              <AppText style={styles.categoryLabel}>{strings.client.rating.overallPerformance}</AppText>
              <View style={styles.tagsContainer}>
                {renderTag('Quality')}
                {renderTag('Professionalism')}
              </View>
            </View>

            {/* Timeliness Category */}
            <View style={styles.categorySection}>
              <AppText style={styles.categoryLabel}>{strings.client.rating.timeliness}</AppText>
              <View style={styles.tagsContainer}>
                {renderTag('Timeliness')}
                {renderTag('Reliability')}
              </View>
            </View>

            {/* Communication Category */}
            <View style={styles.categorySection}>
              <AppText style={styles.categoryLabel}>{strings.client.rating.communication}</AppText>
              <View style={styles.tagsContainer}>
                {renderTag('Communication')}
                {renderTag('Collaboration')}
              </View>
            </View>

            {/* Submit Button */}
            <View style={{ marginTop: 20 }}>
              <CustomButton
                title={strings.client.rating.submit}
                onPress={handleSubmit}
                loading={isSubmitting}
              />
            </View>
          </ScrollView>
        </View>
      </View>
      <CustomToast ref={toastRef} />
</Modal>
  );
};

export default RatingModal;
