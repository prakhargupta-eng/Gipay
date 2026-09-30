import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  UIManager,
  findNodeHandle,
  Image
} from 'react-native';
import colors from '@styles/colors';
import { horizontalScale, verticalScale, fontSize, SCREEN_HEIGHT } from '@styles/mixins';
import AppText from '@components/AppText';

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownFieldProps {
  label?: string;
  placeholder?: string;
  error?: string | null;
  data: (string | DropdownItem)[];
  value?: any;
  onChange: (val: any) => void;
  isMultiSelect?: boolean;
  containerStyle?: any;
  labelStyle?: any;
  wrapperStyle?: any;
  errorTextStyle?: any;
  disabled?: boolean;
  hideCheck?: boolean;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  placeholder = 'Select',
  error,
  data,
  value,
  onChange,
  isMultiSelect = false,
  containerStyle,
  labelStyle,
  wrapperStyle,
  errorTextStyle,
  disabled = false,
  hideCheck = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: undefined as number | undefined,
    bottom: undefined as number | undefined,
    left: 0,
    width: 0,
  });

  const dropdownRef = useRef<View>(null);
  const DROPDOWN_MAX_HEIGHT = verticalScale(250);

  const dropdownData: DropdownItem[] = data.map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    return item;
  });

  const openDropdown = () => {
    if (!dropdownRef.current || disabled) return;

    const handle = findNodeHandle(dropdownRef.current);
    if (handle) {
      UIManager.measureInWindow(
        handle,
        (x, y, measuredWidth, measuredHeight) => {
          const spaceBelow = SCREEN_HEIGHT - (y + measuredHeight);
          const spaceAbove = y;
          const shouldOpenUp = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;

          setDropdownPosition({
            top: shouldOpenUp ? undefined : y + measuredHeight + 6,
            bottom: shouldOpenUp ? SCREEN_HEIGHT - y + 6 : undefined,
            left: x,
            width: measuredWidth,
          });

          setVisible(true);
        },
      );
    }
  };

  const handleSelect = (item: DropdownItem) => {
    if (isMultiSelect) {
      const currentVal = Array.isArray(value) ? value : value ? [value] : [];
      const isSelected = currentVal.includes(item.value);

      if (isSelected) {
        onChange(currentVal.filter((v: string) => v !== item.value));
      } else {
        onChange([...currentVal, item.value]);
      }
    } else {
      onChange(item.value);
      setVisible(false);
    }
  };

  const getDisplayText = () => {
    if (isMultiSelect) return placeholder;
    const selectedItem = dropdownData.find(d => d.value === value);
    return selectedItem ? selectedItem.label : placeholder;
  };

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      {label && <AppText style={[styles.label, labelStyle]}>{label}</AppText>}

      <TouchableOpacity
        ref={dropdownRef}
        activeOpacity={0.8}
        disabled={disabled}
        onPress={openDropdown}
        style={[
          styles.dropdown,
          { borderColor: error ? colors.red : colors.border },
          containerStyle,
          disabled && { opacity: 0.5 },
        ]}
      >
        <AppText style={value && (!isMultiSelect || value.length > 0) ? styles.selectedText : styles.placeholder}>
          {getDisplayText()}
        </AppText>
        <Image
          source={require('@assets/images/common/dropdown.png')}
          style={[styles.arrowIcon, visible && { transform: [{ rotate: '180deg' }] }]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View
            style={[
              styles.dropdownContainer,
              {
                top: dropdownPosition.top,
                bottom: dropdownPosition.bottom,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                maxHeight: DROPDOWN_MAX_HEIGHT,
              },
            ]}
          >
            <FlatList
              data={dropdownData}
              keyExtractor={item => item.value}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const isSelected = isMultiSelect ? value?.includes(item.value) : value === item.value;
                return (
                  <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item)}>
                    <AppText style={[styles.itemText, isSelected && { color: colors.primary, fontWeight: '600' }]}>
                      {item.label}
                    </AppText>
                    {isSelected && !hideCheck && (
                      <Image source={require('@assets/images/common/checkPlain.png')} style={styles.checkIcon} resizeMode="contain" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>

      {isMultiSelect && Array.isArray(value) && value.length > 0 && (
        <View style={styles.tagsContainer}>
          {value.map((id: string) => {
            const item = dropdownData.find(i => i.value === id);
            if (!item) return null;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.tag, disabled && { opacity: 0.6 }]}
                onPress={() => onChange(value.filter((v: string) => v !== id))}
                disabled={disabled}
              >
                <AppText style={styles.tagText}>{item.label}</AppText>
                {!disabled && <AppText style={styles.removeIcon}>×</AppText>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {error && <AppText style={[styles.errorText, errorTextStyle]}>{error}</AppText>}
    </View>
  );
};

export default DropdownField;

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  label: {
    marginBottom: verticalScale(8),
    fontSize: fontSize(14),
    color: colors.textSecondary || colors.gray,
    marginLeft: horizontalScale(4),
  },
  dropdown: {
    height: verticalScale(52),
    borderWidth: 1,
    borderRadius: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  placeholder: { color: colors.textSecondary || colors.gray, fontSize: fontSize(15) },
  selectedText: { color: colors.textDark || colors.black, fontSize: fontSize(15) },
  arrowIcon: { width: horizontalScale(14), height: horizontalScale(14), tintColor: colors.textSecondary },
  check: {
    fontSize: fontSize(14),
    color: colors.primary,
    fontWeight: 'bold',
  },
  checkIcon: { width: horizontalScale(16), height: horizontalScale(16), tintColor: colors.primary },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
  },
  itemText: { fontSize: fontSize(14), color: colors.textDark || colors.black },
  separator: { height: 1, backgroundColor: colors.statBorder || colors.lightGray },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: verticalScale(10) },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightPurple || '#F0EDFF',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 20,
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  tagText: { fontSize: fontSize(12), color: colors.primary, marginRight: horizontalScale(4) },
  removeIcon: { fontSize: fontSize(16), color: colors.primary, fontWeight: 'bold' },
  errorText: {
    color: colors.red,
    fontSize: fontSize(12),
    marginTop: verticalScale(4),
    marginLeft: horizontalScale(4),
  },
});
