import { CURRENCY } from '@constants/strings';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import InputField from '@components/InputField';
import DropdownField from '@components/DropdownField';
import styles from './styles';
import colors from '@styles/colors';
import strings from '@constants/strings';
import { pickMultipleDocuments, types } from '@utils/documentPicker';

import JobService from '@config/jobService';
import { Toast } from '@utils/ToastManager';
import TopHeader from '@components/TopHeader';
import { parseTimeString, getCurrentTimeZone } from '@utils/dateUtils';
import CustomButton from '@components/CustomButton';
import ConfirmationPopup from '@components/ConfirmationPopup';
import { sanitizeDecimalInput } from '@utils/validation';
import { getPresignedUrl, uploadToS3, isUploadAborted } from '@utils/awsUploadHelper';
import { getFileIcon } from '@utils/fileUtils';
import { useSystemStore } from '@store/useSystemStore';
import AppText from '@components/AppText';
import { getLocalDateTime } from '@utils/dateUtils';
import { devDebugger } from '@utils/devDebugger';

const CreateJobScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { settings, fetchSettings } = useSystemStore();
  const isEdit = route.params?.isEdit || false;

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('T')) {
      return new Date(dateStr);
    }
    const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    if (parts.length === 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 > 1000) {
        // YYYY-MM-DD or YYYY/MM/DD
        return new Date(p0, p1 - 1, p2);
      } else if (p2 > 1000) {
        // DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
        // Default to DD/MM/YYYY for British locale representation in user app
        return new Date(p2, p1 - 1, p0);
      }
    }
    return new Date(dateStr);
  };

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  useEffect(() => {
    if (route.params?.selectedLocation) {
      setLocation(route.params.selectedLocation);
      setCoordinates({
        lat: route.params.latitude,
        lng: route.params.longitude,
      });
      setErrors(p => ({ ...p, location: '' }));
    }

    if (route.params?.draftData) {
      const draft = route.params.draftData;
      setJobTitle(draft.jobTitle || '');
      setDescription(draft.description || '');
      setLocation(draft.location || '');
      setContractors(String(draft.contractorsRequired || ''));

      // Map requiredCertifications (array of objects) to array of IDs
      if (draft.requiredCertifications && Array.isArray(draft.requiredCertifications)) {
        const certIds = draft.requiredCertifications.map((c: any) => c._id || c.id || c);
        setCertification(certIds);
      } else {
        setCertification([]);
      }

      setPayRate(String(draft.hourlyRate || ''));

      if (draft.startDate) setStartDate(parseLocalDate(draft.startDate));
      if (draft.endDate) setEndDate(parseLocalDate(draft.endDate));

      if (draft.startTime) {
        const time = parseTimeString(draft.startTime);
        if (time) setStartTime(time);
      }
      if (draft.endTime) {
        const time = parseTimeString(draft.endTime);
        if (time) setEndTime(time);
      }

      if (draft.latitude && draft.longitude) {
        setCoordinates({ lat: draft.latitude, lng: draft.longitude });
      }

      if (draft.postOrderDocuments && Array.isArray(draft.postOrderDocuments)) {
        const mappedDocs = draft.postOrderDocuments.map((d: any) => ({
          name: d.fileName || 'document',
          s3Url: d.fileUrl,
          type: d.fileType ? `application/${d.fileType}` : 'application/pdf',
          size: d.fileSize || 0,
        }));
        setDocuments(mappedDocs);
      }
    }
  }, [route.params?.selectedLocation, route.params?.latitude, route.params?.longitude, route.params?.draftData]);

  useEffect(() => {
    fetchCertificates();
    fetchSettings();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await JobService.getCertificates();
      if (response.success && response.data) {
        // Map the API data if it's an array of objects like { _id, name }
        // The DropdownField can handle string[] or { label, value }[]
        const mapped = response.data.map((item: any) => ({
          label: item.name,
          value: item.id || item._id, // Ensure we get the correct ID
        }));
        setCertificationOptions(mapped);
      }
    } catch (error) {
      devDebugger.error('Error fetching certificates:', error);
    }
  };

  // Form State
  const [isEditable, setIsEditable] = useState(true);
  const [isLoadingJobDetails, setIsLoadingJobDetails] = useState(false);

  useEffect(() => {
    const fetchLatestJobDetails = async () => {
      const jobId = route.params?.draftData?._id || route.params?.draftData?.id;
      if (isEdit && jobId) {
        try {
          setIsLoadingJobDetails(true);
          const response = await JobService.getJobDetails(jobId);
          if (response.success && response.data) {
            const job = response.data;

            // Populate form fields with the absolute latest details from the API
            setJobTitle(job.jobTitle || job.title || '');
            setDescription(job.description || '');
            setLocation(job.location || '');
            setContractors(String(job.contractorsRequired || ''));

            if (job.requiredCertifications && Array.isArray(job.requiredCertifications)) {
              const certIds = job.requiredCertifications.map((c: any) => c._id || c.id || c);
              setCertification(certIds);
            }

            setPayRate(String(job.hourlyRate || ''));

            if (job.startDate) setStartDate(parseLocalDate(job.startDate));
            if (job.endDate) setEndDate(parseLocalDate(job.endDate));

            if (job.startTime) {
              const time = parseTimeString(job.startTime);
              if (time) setStartTime(time);
            }
            if (job.endTime) {
              const time = parseTimeString(job.endTime);
              if (time) setEndTime(time);
            }

            if (job.latitude && job.longitude) {
              setCoordinates({ lat: job.latitude, lng: job.longitude });
            }

            if (job.postOrderDocuments && Array.isArray(job.postOrderDocuments)) {
              const mappedDocs = job.postOrderDocuments.map((d: any) => {
                if (typeof d === 'string') {
                  return {
                    name: d.split('/').pop() || 'document',
                    s3Url: d,
                    type: 'application/pdf',
                    size: 0,
                  };
                }
                return {
                  name: d.fileName || 'document',
                  s3Url: d.fileUrl || d,
                  type: d.fileType ? `application/${d.fileType}` : 'application/pdf',
                  size: d.fileSize || 0,
                };
              });
              setDocuments(mappedDocs);
            }

            // Set the isEditable key from the response
            if (job.isEditable !== undefined) {
              setIsEditable(!!job.isEditable);
            }
          }
        } catch (error) {
          devDebugger.error('Error fetching latest job details:', error);
        } finally {
          setIsLoadingJobDetails(false);
        }
      }
    };

    fetchLatestJobDetails();
  }, [isEdit, route.params?.draftData]);

  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [contractors, setContractors] = useState('');
  const [certification, setCertification] = useState<string[]>([]);
  const [payRate, setPayRate] = useState('');
  const [certificationOptions, setCertificationOptions] = useState<any[]>([]);

  // UI & Logic State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<any[]>([]); // { name, uri, size, type, s3Url, fileName }
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const importIcon = require('@assets/images/common/upload.png');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      uploadAbortControllerRef.current?.abort();
      uploadAbortControllerRef.current = null;
    };
  }, []);

  // Date/Time State
  const [startDate, setStartDate] = useState(() => {
    // const d = new Date();
    // d.setDate(d.getDate() + 1);
    // return d;
    return new Date();
  });
  const [endDate, setEndDate] = useState(() => {
    // const d = new Date();
    // d.setDate(d.getDate() + 2);
    // return d;
    return new Date();
  });
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 10);
    return d;
  });

  // Picker Visibility
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [openStartTime, setOpenStartTime] = useState(false);
  const [openEndTime, setOpenEndTime] = useState(false);

  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<any>(null);
  const isLeavingRef = useRef(false);

  const handleBack = () => navigation.goBack();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Allow if we are submitting or not going back (e.g., navigating forward to Preview)
      if (isSubmitting || isLeavingRef.current || e.data.action.type !== 'GO_BACK') {
        return;
      }

      // If form is completely empty, just allow back without prompt
      if (!jobTitle.trim() && !description.trim() && !location.trim()) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      setPendingNavigationAction(e.data.action);
      setShowDiscardPopup(true);
    });

    return unsubscribe;
  }, [navigation, jobTitle, description, location, isSubmitting]);


  const handlePickDocument = async () => {
    if (documents.length >= 3) {
      Toast.show({ type: 'error', text2: strings.client.createJob.maxDocumentsAllowed });
      return;
    }

    try {
      setErrors(prev => ({ ...prev, document: '' }));

      let minSize = 1 * 1024 * 1024; // 1 MB fallback
      if (settings?.minDocumentSize) {
        if (settings.minDocumentSizeUnit === 'KB') {
          minSize = settings.minDocumentSize * 1024;
        } else {
          minSize = settings.minDocumentSize * 1024 * 1024;
        }
      }

      let maxSize = 5 * 1024 * 1024; // 5 MB fallback
      if (settings?.maxDocumentSize) {
        if (settings.maxDocumentSizeUnit === 'MB') {
          maxSize = settings.maxDocumentSize * 1024 * 1024;
        } else {
          maxSize = settings.maxDocumentSize * 1024;
        }
      }

      const pickedDocs = await pickMultipleDocuments({
        minSize,
        maxSize,
        allowedTypes: [types.pdf, types.doc, types.docx]
      });

      if (pickedDocs.length > 0) {
        const currentCount = documents.length;
        const availableSlots = 3 - currentCount;
        const docsToUpload = pickedDocs.slice(0, availableSlots);

        if (pickedDocs.length > availableSlots) {
          Toast.show({ type: 'info', text2: strings.client.createJob.maxDocumentsAllowed });
        }

        uploadAbortControllerRef.current?.abort();
        const controller = new AbortController();
        uploadAbortControllerRef.current = controller;

        setIsUploadingDoc(true);
        const uploadedDocs: any[] = [];

        for (const doc of docsToUpload) {
          if (controller.signal.aborted) break;

          try {
            const presignedRes = await getPresignedUrl(
              doc.size || 0,
              doc.type || 'application/pdf',
              'job-evidence',
              controller.signal
            );

            if (controller.signal.aborted) break;

            await uploadToS3(
              presignedRes.uploadUrl,
              doc.uri,
              doc.type || 'application/pdf',
              controller.signal
            );

            if (controller.signal.aborted) break;

            uploadedDocs.push({
              ...doc,
              s3Url: presignedRes.key,
              fileName: presignedRes.key?.split('/').pop() || doc.name || 'document',
            });
          } catch (uploadErr: any) {
            if (isUploadAborted(uploadErr, controller.signal)) {
              devDebugger.log('Upload aborted by user in CreateJobScreen');
              break;
            }
            devDebugger.error('Upload error:', uploadErr);
            Toast.show({
              type: 'error',
              text1: strings.client.createJob.uploadFailed,
              text2: strings.client.createJob.couldNotUpload(doc.name || 'document')
            });
          }
        }

        if (!controller.signal.aborted) {
          setDocuments(prev => [...prev, ...uploadedDocs]);
        }
      }
    } catch (err: any) {
      if (isUploadAborted(err, uploadAbortControllerRef.current?.signal)) {
        return;
      }
      Alert.alert(strings.common.error, err.message);
    } finally {
      setIsUploadingDoc(false);
      uploadAbortControllerRef.current = null;
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!jobTitle.trim()) {
      newErrors.jobTitle = strings.validation.jobTitleRequired;
    } else if (jobTitle.length < 3) {
      newErrors.jobTitle = strings.validation.jobTitleMinLength;
    } else if (!/^[a-zA-Z0-9 ]*$/.test(jobTitle)) {
      newErrors.jobTitle = strings.validation.jobTitleAlphanumeric;
    }

    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      newErrors.description = strings.validation.descriptionMinWords || strings.client.createJob.minWordsDesc;
    }

    if (!location.trim()) {
      newErrors.location = strings.validation.locationRequired;
    }

    const contractorCount = Number.parseInt(contractors, 10);
    const maxContractors = settings?.maxContractorsPerJob || 10;
    if (!contractors) {
      newErrors.contractors = strings.client.createJob.contractorMandatory;
    } else if (isNaN(contractorCount) || contractorCount < 1) {
      newErrors.contractors = strings.validation.minContractors;
    } else if (contractorCount > maxContractors) {
      newErrors.contractors = strings.client.createJob.maxContractorsAllowed(maxContractors);
    }

    if (certification.length === 0) {
      newErrors.certification = strings.validation.selectAtLeastOne;
    }

    const now = new Date();
    // const tomorrow = getTomorrow();
    const startD = new Date(startDate); startD.setHours(0, 0, 0, 0);
    const endD = new Date(endDate); endD.setHours(0, 0, 0, 0);

    // 1. Past check for Start Date (allow today, prevent past dates)
    // if (startD < tomorrow) {
    //   newErrors.startDate = strings.client.createJob.startDateTomorrow;
    // }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startD < today) {
      newErrors.startDate = strings.validation.startDatePast;
    }

    // 2. Date-only sequence check
    if (endD < startD) {
      newErrors.endDate = strings.client.createJob.endDateBeforeStart;
    }

    // 2. Time construction for absolute comparison
    const startT = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      startTime.getHours(),
      startTime.getMinutes(),
      0, 0
    );

    const endT = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      endTime.getHours(),
      endTime.getMinutes(),
      0, 0
    );

    // const now = new Date();

    // 3. Past check (allow current minute)
    const currentMinute = new Date();
    currentMinute.setSeconds(0, 0);
    if (startT < currentMinute) {
      newErrors.startTime = strings.client.createJob.startTimePast;
    }
    if (endT < currentMinute) {
      newErrors.endTime = strings.client.createJob.endTimePast;
    }

    // 4. Minimum Duration Gap Check (Cross-Date Friendly) - commented out 1 hour condition
    // const oneHourMs = 3600000; // Minimum 1 hour duration
    // if (endT.getTime() < startT.getTime() + oneHourMs) {
    //   newErrors.endTime = strings.client.createJob.timeDifference;
    // }
    if (endT <= startT) {
      newErrors.endTime = strings.validation.endTimeBeforeStart;
    }

    const parsedPayRate = parseFloat(payRate);
    if (!payRate.trim()) {
      newErrors.payRate = strings.client.createJob.hourlyRateMandatory;
    } else if (isNaN(parsedPayRate) || parsedPayRate < 1) {
      newErrors.payRate = strings.client.createJob.minHourlyRate;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Prioritize timing errors in the Toast for better UX
      const errorMsg = newErrors.startTime || newErrors.endTime || Object.values(newErrors)[0];
      Toast.show({
        type: 'error',
        text2: errorMsg
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  const formatDatePayload = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const formatTimePayload = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  };

  const getJobPayload = (saveAsDraft: boolean) => {
    // Map selected IDs to their corresponding names/labels
    const certNames = certification.map(id => {
      const option = certificationOptions.find(opt => opt.value === id);
      return option ? option.label : id;
    });

    const getExtension = (type?: string) => {
      if (!type) return 'pdf';
      if (type.includes('msword')) return 'doc';
      if (type.includes('wordprocessingml')) return 'docx';
      if (type.includes('pdf')) return 'pdf';
      if (type.includes('image/jpeg') || type.includes('image/jpg')) return 'jpg';
      if (type.includes('image/png')) return 'png';
      return type.split('/')[1] || 'pdf';
    };

    const postOrderDocuments = documents
      .map(doc => doc.s3Url || doc.url)
      .filter(Boolean);

    return {
      saveAsDraft,
      title: jobTitle,
      description,
      location,
      latitude: coordinates?.lat || 0,
      longitude: coordinates?.lng || 0,
      contractorsRequired: Number.parseInt(contractors, 10) || 0,
      requiredCertifications: certification,
      certificationNames: certNames,
      startDate: formatDatePayload(startDate),
      endDate: formatDatePayload(endDate),
      startTime: formatTimePayload(startTime),
      endTime: formatTimePayload(endTime),
      hourlyRate: parseFloat(payRate) || 0,
      timeZone: getCurrentTimeZone(),

      ...(postOrderDocuments.length > 0 ? { postOrderDocuments } : {}),
      selectedDocs: documents,
      _id: route.params?.draftData?._id || route.params?.draftData?.id,
    };
  };

  const handlePreview = () => {
    if (validateForm()) {
      const payload = getJobPayload(false);
      navigation.navigate('JobPreview', {
        jobData: {
          ...payload,
        },
        isCommingfromDraft: route.params?.isCommingfromDraft || false
      });
    }
  };

  const handleSaveAsDraft = async () => {
    if (validateForm()) {


      try {
        setIsSubmitting(true);

        const { certificationNames: _, selectedDocs: __, ...payload } = getJobPayload(true);

        const response = await JobService.createJob(payload);

        if (response.success) {
          Toast.show({
            type: 'success',
            text1: strings.client.createJob.success,
            text2: strings.client.createJob.jobSavedDraft,
          });
          isLeavingRef.current = true;
          navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text2: response.message || strings.client.createJob.failedSaveDraft,
          });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text2: error.message || strings.client.createJob.somethingWentWrong,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formatDate = (date: Date) => getLocalDateTime(date).date;
  const formatTime = (date: Date) => getLocalDateTime(date).time;

  // ─── Sub-Components ────────────────────────────────────
  const DetailItem = ({ icon, text }: { icon: any; text: string }) => (
    <View style={styles.detailRow}>
      <Image source={icon} style={styles.detailIcon} />
      <AppText style={styles.detailText}>{text}</AppText>
    </View>
  );



  const handleUpdateJob = async () => {
    // Basic validation for edit mode if user comming from upcomming flow in jobs 
    if (!description.trim()) {
      setErrors(p => ({ ...p, description: strings.validation.fieldRequired }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const jobId = route.params?.draftData?._id || route.params?.draftData?.id;
      if (!jobId) throw new Error('Job ID not found');

      const payload = {
        contractorsRequired: Number.parseInt(contractors, 10) || 0,
        description: description,
        ...(isEditable ? {
          startDate: formatDatePayload(startDate),
          endDate: formatDatePayload(endDate),
          startTime: formatTimePayload(startTime),
          endTime: formatTimePayload(endTime),
          timeZone: getCurrentTimeZone(),
          title: jobTitle,
        } : {}),
      };

      const response = await JobService.editJob(jobId, payload);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: strings.client.createJob.success,
          text2: strings.client.createJob.jobUpdatedSuccess,
        });
        if (route.params?.onJobUpdated) {
          route.params.onJobUpdated(response.data);
        }
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text2: response.message || strings.client.createJob.failedUpdateJob,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text2: error.message || strings.client.createJob.somethingWentWrong,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderJobInfo = () => (
    <>
      <AppText style={styles.sectionTitle}>{strings.client.createJob.jobInfo}</AppText>
      <InputField
        label={strings.client.createJob.jobTitle}
        placeholder={strings.client.createJob.jobTitlePlaceholder}
        value={jobTitle}
        onChangeText={(t) => {
          const filtered = t.replace(/[^a-zA-Z0-9 ]/g, '');
          setJobTitle(filtered);
          if (filtered !== t) {
            setErrors(p => ({ ...p, jobTitle: strings.validation.jobTitleAlphanumeric }));
          } else {
            setErrors(p => ({ ...p, jobTitle: '' }));
          }
        }}
        error={errors.jobTitle}
        wrapperStyle={styles.fieldWrapper}
        editable={!isEdit || isEditable}
      />
      <InputField
        label={strings.client.createJob.jobDescription}
        placeholder={strings.client.createJob.jobDescriptionPlaceholder}
        value={description}
        onChangeText={(t) => {
          // Remove emojis but allow text, numbers, and punctuation
          const cleaned = t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F02B}\u{1F004}\u{1F0CF}\u{1F0D1}]/gu, '');
          setDescription(cleaned);
          const words = cleaned.trim().split(/\s+/).filter(Boolean).length;
          if (words > 0 && words < 10) {
            setErrors(p => ({ ...p, description: strings.client.createJob.minWordsDesc }));
          } else {
            setErrors(p => ({ ...p, description: '' }));
          }
        }}
        error={errors.description}
        multiline
        numberOfLines={4}
        wrapperStyle={styles.fieldWrapper}
        containerStyle={styles.bioContainer}
        inputStyle={styles.bioInput}
        editable={true} // Always enabled in edit
      />
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !isEdit && navigation.navigate('LocationSearch', {
          onSelectLocation: (name: string, lat: number, lng: number) => {
            setLocation(name);
            setCoordinates({ lat, lng });
            setErrors(p => ({ ...p, location: '' }));
          }
        })}
        disabled={isEdit}
      >
        <InputField
          label={strings.client.createJob.jobLocation}
          placeholder={strings.client.createJob.jobLocationPlaceholder}
          value={location}
          editable={false}
          pointerEvents="none"
          multiline
          containerStyle={styles.locationContainer}
          inputStyle={styles.locationInput}
          onChangeText={(t) => { setLocation(t); setErrors(p => ({ ...p, location: '' })); }}
          error={errors.location}
          wrapperStyle={styles.fieldWrapper}
          renderRightIcon={() => (
            <Image source={require('@assets/images/common/pinLocation.png')} style={{ width: 20, height: 20, tintColor: colors.gray }} />
          )}
        />
      </TouchableOpacity>
      <InputField
        label={strings.client.createJob.contractorsRequired}
        placeholder={strings.client.createJob.contractorsPlaceholder}
        value={contractors}
        onChangeText={(t) => {
          const cleaned = t.replace(/[^0-9]/g, '');
          setContractors(cleaned);
          setErrors(p => ({ ...p, contractors: '' }));
        }}
        error={errors.contractors}
        keyboardType="numeric"
        maxLength={5}
        wrapperStyle={styles.fieldWrapper}
        editable={true} // Always enabled in edit
      />

      <DropdownField
        label={strings.client.createJob.requiredCertification}
        placeholder={strings.client.createJob.requiredCertificationPlaceholder}
        data={certificationOptions}
        value={certification}
        isMultiSelect={true}
        onChange={(v) => { setCertification(v); devDebugger.log("v", v); setErrors(p => ({ ...p, certification: '' })); }}
        error={errors.certification}
        wrapperStyle={styles.fieldWrapper}
        disabled={isEdit}
      />
    </>
  );

  const renderDateTime = () => (
    <>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <AppText style={styles.fieldLabel}>{strings.client.createJob.startDate}</AppText>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              errors.startDate && { borderColor: colors.red },
              isEdit && !isEditable && { opacity: 0.6, backgroundColor: '#f5f5f5' }
            ]}
            onPress={() => setOpenStart(true)}
            disabled={isEdit && !isEditable}
          >
            <AppText style={styles.pickerText}>{startDate ? formatDate(startDate) : strings.client.createJob.selectPlaceholder}</AppText>
            <Image source={require('@assets/images/common/calander.png')} style={styles.pickerIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.halfField}>
          <AppText style={styles.fieldLabel}>{strings.client.createJob.endDate}</AppText>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              errors.endDate && { borderColor: colors.red },
              isEdit && !isEditable && { opacity: 0.6, backgroundColor: '#f5f5f5' }
            ]}
            onPress={() => setOpenEnd(true)}
            disabled={isEdit && !isEditable}
          >
            <AppText style={styles.pickerText}>{endDate ? formatDate(endDate) : strings.client.createJob.selectPlaceholder}</AppText>
            <Image source={require('@assets/images/common/calander.png')} style={styles.pickerIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <AppText style={styles.fieldLabel}>{strings.client.createJob.startTime}</AppText>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              errors.startTime && { borderColor: colors.red },
              isEdit && !isEditable && { opacity: 0.6, backgroundColor: '#f5f5f5' }
            ]}
            onPress={() => setOpenStartTime(true)}
            disabled={isEdit && !isEditable}
          >
            <AppText style={styles.pickerText}>{startTime ? formatTime(startTime) : strings.client.createJob.selectPlaceholder}</AppText>
            <Image source={require('@assets/images/common/blackClock.png')} style={styles.pickerIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.halfField}>
          <AppText style={styles.fieldLabel}>{strings.client.createJob.endTime}</AppText>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              errors.endTime && { borderColor: colors.red },
              isEdit && !isEditable && { opacity: 0.6, backgroundColor: '#f5f5f5' }
            ]}
            onPress={() => setOpenEndTime(true)}
            disabled={isEdit && !isEditable}
          >
            <AppText style={styles.pickerText}>{endTime ? formatTime(endTime) : strings.client.createJob.selectPlaceholder}</AppText>
            <Image source={require('@assets/images/common/blackClock.png')} style={styles.pickerIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <TopHeader title={isEdit ? strings.client.createJob.editJobTitle : strings.client.createJob.screenTitle} onBack={handleBack} />

      <ConfirmationPopup
        visible={showDiscardPopup}
        onClose={() => {
          setShowDiscardPopup(false);
          setPendingNavigationAction(null);
        }}
        onConfirm={() => {
          setShowDiscardPopup(false);
          if (pendingNavigationAction) {
            isLeavingRef.current = true;
            navigation.dispatch(pendingNavigationAction);
          }
        }}
        message={strings.client.createJob.discardChangesTitle}
        subMessage={strings.client.createJob.discardChangesSub}
        confirmText={strings.client.createJob.discardChangesConfirm}
        cancelText={strings.client.createJob.discardChangesCancel}
        isDestructive={true}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isEdit && (
          <View style={styles.editNoticeContainer}>
            <Image source={require('@assets/images/common/info.png')} style={styles.editNoticeIcon} />
            <AppText style={styles.editNoticeText}>
              <AppText style={styles.noteBold}>{strings.client.createJob.editNoticeNote}</AppText>
              {isEditable
                ? strings.client.createJob.editNoticeFull
                : strings.client.createJob.editNoticePartial
              }
            </AppText>
          </View>
        )}
        {renderJobInfo()}

        {renderDateTime()}

        <InputField
          label={strings.client.createJob.hourlyPayRate}
          placeholder={strings.client.createJob.payRatePlaceholder}
          value={payRate}
          maxLength={10}
          onChangeText={(t) => {
            setPayRate(sanitizeDecimalInput(t, '', 3));
            if (errors.payRate) setErrors(prev => ({ ...prev, payRate: '' }));
          }}
          error={errors.payRate}
          keyboardType="decimal-pad"
          wrapperStyle={styles.fieldWrapper}
          renderLeftIcon={() => (
            payRate ? <AppText style={styles.dollarSign}>{CURRENCY.trim()}</AppText> : null
          )}
          editable={!isEdit}
        />


        <View style={styles.documentSection}>
          <AppText style={styles.uploadSectionHeader}>
            {strings.client.createJob.documentUploadTitle}
          </AppText>

          <TouchableOpacity
            style={[
              styles.uploadContainer,
              (isUploadingDoc || documents.length >= 3) && { opacity: 0.7 }
            ]}
            onPress={handlePickDocument}
            activeOpacity={0.7}
            disabled={isUploadingDoc || isEdit || documents.length >= 3}
          >
            {isUploadingDoc ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <View style={styles.uploadIconContainer}>
                  <Image source={importIcon} style={styles.upload} />
                </View>
                <AppText style={styles.uploadText}>{strings.auth.client.setupOrg.uploadPlaceholder}</AppText>
                <AppText style={styles.uploadSubText}>{strings.client.createJob.uploadSubtitle(settings?.maxDocumentSize || 5, settings?.maxDocumentSizeUnit || 'MB')}</AppText>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.uploadedDocsList}>
            {documents.map((doc, index) => (
              <View key={index} style={styles.docItemRow}>
                <View style={styles.docPreviewBox}>
                  <Image
                    source={getFileIcon(doc.s3Url || doc.uri)}
                    style={styles.docIconLarge}
                  />
                  {!isEdit && (
                    <TouchableOpacity
                      style={styles.removeDocBadge}
                      onPress={() => {
                        const newDocs = [...documents];
                        newDocs.splice(index, 1);
                        setDocuments(newDocs);
                      }}
                    >
                      <Image
                        source={require('@assets/images/common/close.png')}
                        style={styles.removeIconImg}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <AppText style={styles.docNameText} numberOfLines={2}>
                  {doc.fileName || doc.name}
                </AppText>
              </View>
            ))}
          </View>
        </View>


      </ScrollView>

      {isEdit ? (
        <View style={styles.buttonRow}>
          <CustomButton
            title={strings.client.createJob.updateBtn}
            onPress={handleUpdateJob}
            loading={isSubmitting}
            style={{ width: '100%' }}
            disabled={isUploadingDoc}
          />
        </View>
      ) : (
        <View style={styles.buttonRow}>
          {!(route.params?.draftData) && (
            <CustomButton
              title={strings.client.createJob.saveAsDraft}
              onPress={handleSaveAsDraft}
              loading={isSubmitting}
              style={{
                width: '48%',
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.primary
              }}
              textStyle={{ color: colors.primary }}
              gradientColors={[colors.white, colors.white]}
              disabled={isUploadingDoc}
            />
          )}
          <CustomButton
            title={strings.client.createJob.preview}
            onPress={handlePreview}
            style={{ width: route.params?.draftData ? '100%' : '48%' }}
            disabled={isUploadingDoc}
          />
        </View>
      )}

      <DatePicker
        modal
        open={openStart}
        date={startDate}
        mode="date"
        minimumDate={isEdit ? undefined : new Date()}
        //        minimumDate={isEdit ? undefined : getTomorrow()}
        onConfirm={(d) => {
          setOpenStart(false);
          setStartDate(d);
          // Default End Date to the same as Start Date for better UX
          setEndDate(d);
        }}
        onCancel={() => setOpenStart(false)}
      />
      <DatePicker
        modal
        open={openEnd}
        date={endDate}
        mode="date"
        minimumDate={startDate}
        onConfirm={(d) => {
          setOpenEnd(false);
          setEndDate(d);
        }}
        onCancel={() => setOpenEnd(false)}
      />
      <DatePicker
        modal
        open={openStartTime}
        date={startTime}
        mode="time"
        onConfirm={(d) => {
          setOpenStartTime(false);
          setStartTime(d);

          // Auto-fill End Time to be at least 10 minutes after the new Start Time
          const autoEnd = new Date(d.getTime() + 10 * 60 * 1000);
                    // Auto-fill End Time to be at least 1 hour after the new Start Time

          //          const autoEnd = new Date(d.getTime() + 60 * 60 * 1000);
          setEndTime(autoEnd);

          // Clear errors if any
          setErrors(p => ({ ...p, startTime: '', endTime: '' }));
        }}
        onCancel={() => setOpenStartTime(false)}
      />
      <DatePicker
        modal
        open={openEndTime}
        date={endTime}
        mode="time"
        onConfirm={(d) => {
          const absoluteStart = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            startTime.getHours(),
            startTime.getMinutes(),
            0, 0
          );
          const absoluteEnd = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            d.getHours(),
            d.getMinutes(),
            0, 0
          );

          const now = new Date();

          // 1. Past check
          if (absoluteEnd < now) {
            Toast.show({
              type: 'error',
              text2: strings.client.createJob.endTimePast
            });
            return;
          }

          // 2. Minimum Duration Gap Check (at least 1 hour) - commented out
          // const oneHourMs = 3600000;
          // if (absoluteEnd.getTime() < absoluteStart.getTime() + oneHourMs) {
          //   Toast.show({
          //     type: 'error',
          //     text2: strings.client.createJob.timeDifference
          //   });
          //   setOpenEndTime(false);
          //   return;
          // }

          if (absoluteEnd <= absoluteStart) {
            Toast.show({
              type: 'error',
              text2: strings.validation.endTimeBeforeStart
            });
            setOpenEndTime(false);
            return;
          }

          setOpenEndTime(false);
          setEndTime(d);
          setErrors(p => ({ ...p, endTime: '' }));
        }}
        onCancel={() => setOpenEndTime(false)}
      />
    </View>
  );
};

export default CreateJobScreen;
