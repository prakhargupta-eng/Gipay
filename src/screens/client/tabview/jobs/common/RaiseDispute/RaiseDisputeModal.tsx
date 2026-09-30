import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Toast } from '@utils/ToastManager';

import strings from '@constants/strings';
import colors from '@styles/colors';
import styles from './styles';
import { pickDocument, PickedDocument, types } from '@utils/documentPicker';

import CustomButton from '@components/CustomButton';
import DropdownField from '@components/DropdownField';
import JobService from '@config/jobService';
import { getPresignedUrl, uploadToS3, isUploadAborted } from '@utils/awsUploadHelper';
import AuthService from '@config/authService';
import { useUserStore } from '@store/useUserStore';
import { useSystemStore } from '@store/useSystemStore';
import AppText from '@components/AppText';
import CustomToast from '@components/CustomToast';
import { devDebugger } from '@utils/devDebugger';
import DisputeService from '@config/disputeService';


export enum DisputeContinuationOption {
  LEAVE_JOB_NOW = 'LEAVE_JOB_NOW',
  LEAVE_AFTER_DISPUTE_RESOLUTION = 'LEAVE_AFTER_DISPUTE_RESOLUTION',
  CONTINUE_WITH_JOB = 'CONTINUE_WITH_JOB',
}

interface RaiseDisputeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  jobId: string;
  attendanceId?: string;
  commingFromContractore?: boolean;
  hideOption?: boolean;
}

const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({ visible, onClose, onSubmit, jobId, commingFromContractore, attendanceId, hideOption }) => {
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedContrecterAttendanceId, setSelectedContrecterAttendanceId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState<DisputeContinuationOption | ''>('');

  React.useEffect(() => {
    if (selectedOption) {
      devDebugger.log('Selected Dispute Continuation Option:', selectedOption);
    }
  }, [selectedOption]);
  const [evidences, setEvidences] = useState<{ doc: PickedDocument; url: string }[]>([]);
  const [errors, setErrors] = useState<{ contractor?: string; category?: string; subject?: string; description?: string; option?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const toastRef = useRef<any>(null);
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const [internalContractorList, setInternalContractorList] = useState<any[]>([]);
  const [disputeCategories, setDisputeCategories] = useState<any[]>([]);
  const [isLoadingContractors, setIsLoadingContractors] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  const resetState = () => {
    // Abort any ongoing image upload immediately
    if (uploadAbortControllerRef.current) {
      uploadAbortControllerRef.current.abort();
      uploadAbortControllerRef.current = null;
    }
    setIsUploadingDoc(false);
    setIsSubmitting(false);
    setSelectedContractor('');
    setSelectedContrecterAttendanceId('');
    setSelectedCategory('');
    setSubject('');
    setDescription('');
    setSelectedOption('');
    setEvidences([]);
    setErrors({});
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const settings = useSystemStore(state => state.settings);
  const fetchSettings = useSystemStore(state => state.fetchSettings);

  React.useEffect(() => {
    if (visible) {
      fetchSettings();
      fetchDisputeCategories();
    } else {
      resetState();
    }
    return () => {
      resetState();
    };
  }, [visible, fetchSettings]);

  const maxSizeUnit = settings?.maxDocumentSizeUnit || 'MB';
  const maxSizeValue = settings?.maxDocumentSize || 5;
  const maxSizeInBytes = maxSizeUnit.toUpperCase() === 'MB' ? maxSizeValue * 1024 * 1024 : maxSizeValue * 1024;

  const minSizeUnit = settings?.minDocumentSizeUnit || 'KB';
  const minSizeValue = settings?.minDocumentSize || 10;
  const minSizeInBytes = minSizeUnit.toUpperCase() === 'MB' ? minSizeValue * 1024 * 1024 : minSizeValue * 1024;

  const imageSizeLimitText = strings.client.raiseDispute.imageSizeLimit(
    minSizeValue,
    minSizeUnit,
    maxSizeValue,
    maxSizeUnit
  );

  React.useEffect(() => {
    if (visible && jobId) {
      fetchEligibleContractors();
    }
  }, [visible, jobId]);

  const fetchDisputeCategories = async () => {
    try {
      setIsLoadingCategory(true);
      const res = await DisputeService.getDisputeCategories();
      if (res.success && res.data) {
        setDisputeCategories(res.data);
      }
    } catch (error) {
      devDebugger.error('Error fetching dispute categories:', error);
    } finally {
      setIsLoadingCategory(false);
    }
  };

  const fetchEligibleContractors = async () => {
    try {
      setIsLoadingContractors(true);
      if (commingFromContractore) {
        devDebugger.log('Contractor side dispute API call/handling - eligible contractors');
        setIsLoadingContractors(false);
        return;
      }
      const res = await JobService.getDisputeEligibleContractors(jobId);
      if (res.success && res.data) {
        setInternalContractorList(res.data);
      }
    } catch (error) {
      devDebugger.error('Error fetching dispute eligible contractors:', error);
    } finally {
      setIsLoadingContractors(false);
    }
  };

  const rawContractors = internalContractorList;

  // Ensure contractors are unique by ID to prevent React key duplicate warnings
  const uniqueContractorsMap = new Map();
  rawContractors?.forEach(c => {
    const id = c.contractorId || c.id || c._id;
    if (id && !uniqueContractorsMap.has(id)) {
      uniqueContractorsMap.set(id, c);
    }
  });

  const contractorsToDisplay = Array.from(uniqueContractorsMap.values()).filter(c => c.isAbleToDispute !== false);

  const handlePickDocument = async () => {
    if (evidences.length >= 5) return;
    try {
      const result = await pickDocument({
        minSize: minSizeInBytes,
        maxSize: maxSizeInBytes,
        allowedTypes: Platform.OS === 'ios'
          ? ['public.jpeg', 'public.png']
          : ['image/jpeg', 'image/png']
      });

      if (result) {
        const fileType = result.type?.toLowerCase() || '';
        const fileName = result.name?.toLowerCase() || '';

        if (
          !fileType.includes('jpeg') &&
          !fileType.includes('png') &&
          !fileName.endsWith('.jpg') &&
          !fileName.endsWith('.jpeg') &&
          !fileName.endsWith('.png')
        ) {
          toastRef.current?.show({ type: 'error', text2: 'Only PNG and JPG images are supported.' });
          setIsUploadingDoc(false);
          return;
        }

        const controller = new AbortController();
        uploadAbortControllerRef.current = controller;
        setIsUploadingDoc(true);

        // Upload immediately
        const presignedRes = await getPresignedUrl(
          result.size || 0,
          result.type || 'image/jpeg',
          'job-evidence',
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        if (presignedRes?.uploadUrl || presignedRes?.url) {
          const urlToUse = presignedRes.uploadUrl || presignedRes.url;
          await uploadToS3(urlToUse, result.uri, result.type || 'image/jpeg', controller.signal);

          if (!controller.signal.aborted) {
            setEvidences(prev => [...prev, { doc: result, url: presignedRes.key }]);
          }
        } else {
          if (!controller.signal.aborted) {
            toastRef.current?.show({ type: 'error', text2: strings.client.raiseDispute.failedToGetUploadUrl });
          }
        }

      }
    } catch (err: any) {
      if (isUploadAborted(err, uploadAbortControllerRef.current?.signal)) {
        devDebugger.log('Upload was aborted by user closing modal');
        return;
      }
      devDebugger.log('Error picking/uploading document:', err);
      toastRef.current?.show({ type: 'error', text2: err.message || strings.client.raiseDispute.uploadFailed });
    } finally {
      setIsUploadingDoc(false);
      uploadAbortControllerRef.current = null;
    }
  };

  const handleRemoveDocument = (index: number) => {
    setEvidences(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    let newErrors: any = {};
    if (!selectedCategory) {
      newErrors.category = strings.client.raiseDispute.categoryRequired;
    }
    if (!commingFromContractore && !selectedContractor) {
      newErrors.contractor = strings.client.raiseDispute.contractorRequired;
    }

    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      newErrors.subject = strings.client.raiseDispute.subjectRequired;
    } else if (trimmedSubject.length < 5 || trimmedSubject.length > 100) {
      newErrors.subject = strings.client.raiseDispute.subjectValidationLength;
    } else {
      const allowedPattern = /^[a-zA-Z0-9\s\-_.,&()]+$/;
      if (!allowedPattern.test(trimmedSubject)) {
        newErrors.subject = strings.client.raiseDispute.subjectValidationInvalidChars;
      } else {
        const subjectWords = trimmedSubject.split(/\s+/).filter(Boolean).length;
        if (subjectWords < 3 || subjectWords > 100) {
          newErrors.subject = strings.client.raiseDispute.subjectValidationWords;
        }
      }
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      newErrors.description = strings.client.raiseDispute.descriptionRequired;
    } else if (trimmedDesc.length < 20 || trimmedDesc.length > 2000) {
      newErrors.description = strings.client.raiseDispute.descriptionValidationLength;
    }

    if (commingFromContractore && !hideOption && !selectedOption) {
      newErrors.option = strings.client.raiseDispute.optionRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      let evidence: string[] = evidences.map(e => e.url);

      const payload: any = {
        subject: subject.trim(),
        description: description.trim(),
        contractorId: selectedContractor, // Including this as per the form
        disputeCategoryId: selectedCategory,
      };
      if (selectedContrecterAttendanceId) {
        payload.attendanceId = selectedContrecterAttendanceId;
      }
      if (evidence.length > 0) {
        payload.evidence = evidence;
      }

      if (commingFromContractore) {
        const contractorPayload: any = {
          subject: subject.trim(),
          description: description.trim(),
          attendanceId: attendanceId,
          disputeCategoryId: selectedCategory,
        };

        if (!hideOption && selectedOption) {
          contractorPayload.continuationOption = selectedOption;
        }

        if (evidence.length > 0) {
          contractorPayload.evidence = evidence;
        }
        const response = await JobService.raiseContractorDispute(jobId, contractorPayload);

        if (response.success) {
          const isLeave = contractorPayload?.continuationOption === 'LEAVE_JOB_NOW' || selectedOption === DisputeContinuationOption.LEAVE_JOB_NOW;
          if (isLeave && jobId) {
            useUserStore.getState().addDisputeLeaveJobId(jobId);
          }
          if (jobId) {
            useUserStore.getState().addDisputedJobId(jobId);
          }

          onSubmit?.(contractorPayload);
          handleClose();
          setTimeout(() => {
            Toast.show({
              type: 'success',
              text1: strings.common.success,
              text2: strings.client.raiseDispute.raiseDisputeSuccess,
            });
          }, 300);
        } else {
          toastRef.current?.show({
            type: 'error',
            text2: response.message || strings.client.raiseDispute.raiseDisputeFailed,
          });
        }
        setIsSubmitting(false);
        return;
      }

      const response = await JobService.raiseDispute(jobId, payload);

      if (response.success) {
        // Recall profile to update escrow/counts if needed
        const profileRes = await AuthService.getClientProfileInfo();
        if (profileRes.success && profileRes.data) {
          useUserStore.getState().setClientProfile(profileRes.data);
        }

        onSubmit?.(payload);
        handleClose();

        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: strings.common.success,
            text2: strings.client.raiseDispute.raiseDisputeSuccess,
          });
        }, 300);
      } else {
        toastRef.current?.show({
          type: 'error',
          text2: response.message || strings.client.raiseDispute.raiseDisputeFailed,
        });
      }
    } catch (error: any) {
      toastRef.current?.show({
        type: 'error',
        text2: error?.response?.data?.message || error.message || strings.common.somethingWentWrong,
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
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%' }}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <AppText style={styles.title}>{strings.client.raiseDispute.screenTitle}</AppText>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Image
                  source={require('@assets/images/common/closeIcon.png')}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              showsHorizontalScrollIndicator={true}
            >
              {!commingFromContractore && (
                <View style={styles.contractorStyle}>
                  {/* Contractor Name */}
                  <DropdownField
                    label={strings.client.raiseDispute.contractorName}
                    placeholder={isLoadingContractors ? 'Loading contractors...' : strings.client.raiseDispute.selectContractor}
                    data={contractorsToDisplay?.map(c => ({
                      label: c.fullName || c.contractorName || c.name || 'Unknown',
                      value: c.contractorId || c.id || c._id
                    })) || []}
                    value={selectedContractor}
                    disabled={!contractorsToDisplay || contractorsToDisplay.length === 0}
                    onChange={(val) => {
                      setSelectedContractor(val);
                      const matched = contractorsToDisplay?.find(c => (c.contractorId || c.id || c._id) === val);
                      if (matched?.attendanceId) {
                        setSelectedContrecterAttendanceId(matched.attendanceId);
                      } else {
                        setSelectedContrecterAttendanceId('');
                      }
                      if (errors.contractor) setErrors(prev => ({ ...prev, contractor: undefined }));
                    }}
                    wrapperStyle={{ marginTop: 0 }}
                  />
                  {errors.contractor && <AppText style={styles.errorText}>{errors.contractor}</AppText>}
                </View>
              )}
              <DropdownField
                label={strings.client.raiseDispute.categoryList || strings.client.raiseDispute.cetegoryList}
                placeholder={isLoadingCategory ? 'Loading categories...' : (strings.client.raiseDispute.selectCategory || strings.client.raiseDispute.selectCetegory)}
                data={disputeCategories?.map(d => ({
                  label: d.name,
                  value: d._id || d.id
                })) || []}
                value={selectedCategory}
                disabled={!disputeCategories || disputeCategories.length === 0}
                onChange={(val) => {
                  setSelectedCategory(val);
                  if (errors.category) setErrors(prev => ({ ...prev, category: undefined }));
                }}
                wrapperStyle={{ marginTop: 0 }}
              />
              {errors.category && <AppText style={styles.errorText}>{errors.category}</AppText>}

              {/* Subject */}
              <AppText style={styles.label}>{strings.client.raiseDispute.subject}</AppText>
              <TextInput allowFontScaling={false} style={[styles.input, errors.subject && { borderColor: 'red' }]}
                returnKeyType="done"
                placeholder={strings.client.raiseDispute.enterSubject}
                placeholderTextColor={colors.gray}
                value={subject}
                maxLength={100}
                onChangeText={(text) => {
                  setSubject(text);
                  if (errors.subject) setErrors(prev => ({ ...prev, subject: undefined }));
                }}
              />
              {errors.subject && <AppText style={styles.errorText}>{errors.subject}</AppText>}

              {/* Upload Image */}
              <AppText style={styles.label}>{strings.client.raiseDispute.uploadImage}</AppText>
              <TouchableOpacity
                style={[styles.uploadBox, (isUploadingDoc || evidences.length >= 5) && { opacity: 0.6 }]}
                activeOpacity={0.7}
                onPress={handlePickDocument}
                disabled={isUploadingDoc || isSubmitting || evidences.length >= 5}
              >
                {isUploadingDoc ? (
                  <ActivityIndicator size="small" color="#00C254" />
                ) : (
                  <>
                    <View style={styles.uploadIconContainer}>
                      <Image source={require('@assets/images/common/upload.png')} style={styles.uploadIcon} />
                    </View>
                    <AppText style={styles.uploadMainText}>
                      {strings.client.raiseDispute.uploadImageOnly}
                    </AppText>
                    <AppText style={styles.uploadSubText}>{imageSizeLimitText}</AppText>
                  </>
                )}
              </TouchableOpacity>

              {evidences.length > 0 && (
                <View style={styles.previewWrapper}>
                  {evidences.map((ev, index) => (
                    <View key={index} style={styles.previewContainer}>
                      <View style={styles.documentThumbnail}>
                        <Image
                          source={require('@assets/images/common/png.png')}
                          style={styles.documentIcon}
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveDocument(index)}
                        >
                          <Image
                            source={require('@assets/images/common/close.png')}
                            style={styles.removeIconImg}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                      <AppText style={styles.fileName} numberOfLines={2}>
                        {ev.doc.name || 'document'}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}

              {/* Description */}
              <AppText style={styles.label}>{strings.client.raiseDispute.description}</AppText>
              <View style={[styles.textAreaContainer, errors.description && { borderColor: 'red' }]}>
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  indicatorStyle="default"
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <TextInput
                    allowFontScaling={false}
                    style={styles.innerTextArea}
                    placeholder={strings.client.raiseDispute.enterDescription}
                    placeholderTextColor={colors.gray}
                    multiline={true}
                    scrollEnabled={false}
                    textAlignVertical="top"
                    value={description}
                    maxLength={2000}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                    }}
                  />
                </ScrollView>
              </View>
              {errors.description && <AppText style={styles.errorText}>{errors.description}</AppText>}

              {/* Action Options (Contractor side only) */}
              {commingFromContractore && !hideOption && (
                <>
                  <AppText style={styles.label}>{strings.client.raiseDispute.actionLabel}</AppText>
                  <View style={styles.optionsContainer}>
                    {[
                      { id: DisputeContinuationOption.LEAVE_JOB_NOW, label: strings.client.raiseDispute.leaveJobNow },
                      // { id: DisputeContinuationOption.LEAVE_AFTER_DISPUTE_RESOLUTION, label: strings.client.raiseDispute.leaveAfterResolve },
                      { id: DisputeContinuationOption.CONTINUE_WITH_JOB, label: strings.client.raiseDispute.continueJob },
                    ].map((item) => {
                      const isSelected = selectedOption === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.radioOptionRow}
                          activeOpacity={0.7}
                          onPress={() => {
                            devDebugger.log('Selected Option tapped:', item.id);
                            setSelectedOption(item.id);
                            if (errors.option) {
                              setErrors(prev => ({ ...prev, option: undefined }));
                            }
                          }}
                        >
                          <View style={[styles.radioBtn, isSelected && styles.radioBtnSelected]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <AppText style={[styles.radioText, isSelected && styles.radioTextSelected]}>
                            {item.label}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                    {errors.option && <AppText style={styles.errorText}>{errors.option}</AppText>}
                  </View>
                </>
              )}

              {/* Notes */}
              <View style={styles.notesContainer}>
                <AppText style={styles.noteText}>{strings.client.raiseDispute.disputeWindowNote(settings?.disputeWindowHours || 24)}</AppText>
                <AppText style={styles.noteText}>{strings.client.raiseDispute.adminAuthorityNote}</AppText>
                <AppText style={styles.noteText}>{strings.client.raiseDispute.deductionNote}</AppText>
              </View>

              {/* Submit Button */}
              <CustomButton
                title={strings.client.raiseDispute.submit}
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting || isUploadingDoc}
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
        <CustomToast ref={toastRef} />
      </View>
    </Modal>
  );
};

export default RaiseDisputeModal;
