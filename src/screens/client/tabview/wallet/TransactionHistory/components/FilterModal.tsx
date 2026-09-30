import React, { useState ,useRef } from 'react';
import CustomToast from '@components/CustomToast';
import { View, Modal, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Toast } from '@utils/ToastManager';
import AppText from '@components/AppText';
import colors from '@styles/colors';
import styles from './FilterModalStyles';
import strings from '@constants/strings';

const filterStrings = strings.client.wallet.filterModal;

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const STATUS_OPTIONS = [
  { id: 'all', label: filterStrings.options.all },
  { id: 'successful', label: filterStrings.options.successful },
  { id: 'pending', label: filterStrings.options.pending },
  { id: 'failed', label: filterStrings.options.failed },
];

const TYPE_OPTIONS = [
  { id: 'all', label: filterStrings.options.allTypes },
  { id: 'paid', label: filterStrings.options.paidToContractor },
  { id: 'add', label: filterStrings.options.addMoney },
];



const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply }) => {
  const [status, setStatus] = useState('all');
  const toastRef = useRef<any>(null);
  const [type, setType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const handleReset = () => {
    setStatus('all');
    setType('all');
    setDateRange('all');
    setStartDate(null);
    setEndDate(null);
    
    onApply({
      status: 'all',
      type: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: ''
    });
    onClose();
  };
  
  const isDefault = status === 'all' && type === 'all' && dateRange === 'all' && startDate === null && endDate === null;

  const formatDateUI = (date: Date | null, fallback: string) => {
    if (!date) return fallback;
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  const formatDateAPI = (date: Date | null) => {
    if (!date) return '';
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const renderPill = (
    item: { id: string; label: string },
    selectedValue: string,
    onSelect: (val: string) => void
  ) => {
    const isSelected = selectedValue === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.pill, isSelected && styles.pillSelected]}
        onPress={() => onSelect(item.id)}
        activeOpacity={0.7}
      >
        <AppText style={[styles.pillText, isSelected && styles.pillTextSelected]}>
          {item.label}
        </AppText>
      </TouchableOpacity>
    );
  };

  const renderRadio = (
    item: { id: string; label: string },
    selectedValue: string,
    onSelect: (val: string) => void
  ) => {
    const isSelected = selectedValue === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.radioRow}
        onPress={() => onSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.radioBtn, isSelected && styles.radioBtnSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <AppText style={styles.radioText}>{item.label}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.handleBar} />
          
          <View style={styles.header}>
            <AppText style={styles.title}>{filterStrings.title}</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Image source={require('@assets/images/common/closeIcon.png')} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>{filterStrings.status}</AppText>
              <View style={styles.pillContainer}>
                {STATUS_OPTIONS.map(opt => renderPill(opt, status, setStatus))}
              </View>
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>{filterStrings.transactionType}</AppText>
              <View style={styles.pillContainer}>
                {TYPE_OPTIONS.map(opt => renderPill(opt, type, setType))}
              </View>
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>{filterStrings.dateRange}</AppText>              
              
              <View style={styles.dateInputsContainer}>
                <TouchableOpacity style={styles.dateInput} activeOpacity={0.7} onPress={() => setOpenStart(true)}>
                  <AppText style={[styles.dateText, !startDate && { color: '#9CA3AF' }]}>
                    {formatDateUI(startDate, filterStrings.startDate)}
                  </AppText>
                  <Image source={require('@assets/images/common/calanderGray.png')} style={styles.calendarIcon} />
                </TouchableOpacity>
                <AppText style={styles.dash}>-</AppText>
                <TouchableOpacity style={styles.dateInput} activeOpacity={0.7} onPress={() => setOpenEnd(true)}>
                  <AppText style={[styles.dateText, !endDate && { color: '#9CA3AF' }]}>
                    {formatDateUI(endDate, filterStrings.endDate)}
                  </AppText>
                  <Image source={require('@assets/images/common/calanderGray.png')} style={styles.calendarIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.resetBtn, isDefault && { borderColor: '#D1D5DB' }]} 
              onPress={handleReset} 
              activeOpacity={0.7}
              disabled={isDefault}
            >
              <AppText style={[styles.resetBtnText, isDefault && { color: '#9CA3AF' }]}>{filterStrings.reset}</AppText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyBtn} 
              onPress={() => {
                if ((startDate && !endDate) || (!startDate && endDate)) {
                  Toast.showError(filterStrings.errors.bothDatesMandatory);
                  return;
                }
                
                if (startDate && endDate) {
                  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                  const today = new Date();
                  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  if (start > todayDate || end > todayDate) {
                    Toast.showError(filterStrings.errors.futureDates);
                    return;
                  }
                  
                  if (start > end) {
                    Toast.showError(filterStrings.errors.endDateBeforeStart);
                    return;
                  }
                }

                onApply({ 
                  status, 
                  type, 
                  dateRange,
                  startDate: formatDateAPI(startDate),
                  endDate: formatDateAPI(endDate)
                });
                onClose();
              }} 
              activeOpacity={0.7}
            >
              <AppText style={styles.applyBtnText}>{filterStrings.applyFilters}</AppText>
            </TouchableOpacity>
          </View>
          
          <DatePicker
            modal
            mode="date"
            open={openStart}
            date={startDate || new Date()}
            maximumDate={endDate || new Date()}
            onConfirm={(date) => {
              setOpenStart(false);
              setStartDate(date);
            }}
            onCancel={() => setOpenStart(false)}
          />

          <DatePicker
            modal
            mode="date"
            open={openEnd}
            date={endDate || startDate || new Date()}
            minimumDate={startDate ? startDate : undefined}
            maximumDate={new Date()}
            onConfirm={(date) => {
              setOpenEnd(false);
              setEndDate(date);
            }}
            onCancel={() => setOpenEnd(false)}
          />
        </View>
      </View>
      <CustomToast ref={toastRef} />
</Modal>
  );
};

export default FilterModal;
