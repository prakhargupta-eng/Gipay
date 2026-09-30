/**
 * Validates a full name string based on the following criteria:
 * - Minimum of 2 characters and a maximum of 100 characters.
 * - Only alphabets and spaces are allowed.
 * - First letter should be capital.
 * - Multiple consecutive spaces should not be allowed.
 * - Mandatory field.
 * 
 * @param name The full name to validate
 * @returns An error message if invalid, or an empty string if valid.
 */
export const validateFullName = (name: string): string => {
    if (!name || name.trim().length === 0) {
        return 'Full Name is a mandatory';
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
        return 'The field should be a minimum of 2 characters and a maximum of 100 characters.';
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return 'Only alphabets and spaces are allowed.';
    }

    if (/\s\s+/.test(name)) {
        return 'Multiple consecutive spaces should not be allowed.';
    }

    if (!/^[A-Z]/.test(trimmedName)) {
        return 'In fullname, first letter should be capital.';
    }

    return '';
};

/**
 * Validates a password string based on the following criteria:
 * - Minimum character should be 8.
 * - At least one upper case letter (A-Z).
 * - At least one lower case letter (a-z).
 * - There should be one digit (0-9).
 * - At least one special character (e.g., @, #, $, %, &, *).
 * 
 * @param pass The password to validate
 * @returns An error message if invalid, or an empty string if valid.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export const validatePassword = (pass: string): string => {
    if (!pass) {
        return 'Password is mandatory.';
    }
    if (pass.length < 8) {
        return 'Minimum character should be 8.';
    }
    if (pass.length > 20) {
        return 'Maximum character should be 20.';
    }
    if (!/[A-Z]/.test(pass)) {
        return 'At least one upper case letter (A-Z).';
    }
    if (!/[a-z]/.test(pass)) {
        return 'At least one lower case letter (a-z).';
    }
    if (!/[0-9]/.test(pass)) {
        return 'There should be one digit (0-9).';
    }
    if (!PASSWORD_SPECIAL_REGEX.test(pass)) {
        return 'At least one special character (e.g., @, #, $, %, &, *).';
    }
    return '';
};

export const validateEmail = (email: string): string => {
    const normalized = (email || '').trim().toLowerCase();
    if (!normalized) {
        return 'Email is mandatory.';
    }
    if (!EMAIL_REGEX.test(normalized)) {
        return 'Invalid email address.';
    }
    return '';
};

export const formatEmail = (email: string): string => {
    return (email || '')
        .replace(/\s+/g, '') // Remove all whitespace
        .replace(/[^a-zA-Z0-9@._\-+]/g, '') // Keep only valid email characters
        .toLowerCase();
};

const onlyDigits = (value: string) => (value || '').replace(/\D/g, '');

export const formatCanadianPhone = (value: string): string => {
    const digits = onlyDigits(value);
    if (!digits) return '';

    const withoutCountry = digits.startsWith('1') ? digits.slice(1) : digits;
    const local = withoutCountry.slice(0, 10);

    const a = local.slice(0, 3);
    const b = local.slice(3, 6);
    const c = local.slice(6, 10);

    if (local.length <= 3) return `+1 ${a}`;
    if (local.length <= 6) return `+1 ${a}-${b}`;
    return `+1 ${a}-${b}-${c}`;
};

export const validateCanadianPhone = (value: string): string => {
    const digits = onlyDigits(value);
    if (!digits) {
        return 'Mobile number is mandatory.';
    }
    const local = digits.startsWith('1') ? digits.slice(1) : digits;
    if (local.length !== 10) {
        return 'Please enter a valid Canadian mobile number.';
    }
    return '';
};

export const capitalizeFirstCharacter = (value: string): string => {
    if (!value) return '';
    const first = value.charAt(0).toUpperCase();
    return `${first}${value.slice(1)}`;
};

/**
 * Formats a Date object to DD-MM-YYYY string.
 */
export const formatDateDDMMYYYY = (date: Date): string => {
    if (!date) return '';
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${d < 10 ? '0' + d : d}-${m < 10 ? '0' + m : m}-${y}`;
};

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
export const formatDateYYYYMMDD = (date: Date): string => {
    if (!date) return '';
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
};

/**
 * Formats a date string (ISO or local) to DD/MM/YYYY format.
 */
export const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
        // If it's already in DD/MM/YYYY or DD-MM-YYYY, return it normalized with /
        if (dateStr.includes('/') || (dateStr.includes('-') && dateStr.split('-')[0].length === 2)) {
            return dateStr.replace(/-/g, '/');
        }

        // Prevent timezone shifting by extracting the date part directly from ISO strings
        if (dateStr.includes('T') && dateStr.indexOf('-') === 4) {
            const datePart = dateStr.split('T')[0];
            const [yyyy, mm, dd] = datePart.split('-');
            if (yyyy && mm && dd) {
                return `${dd}/${mm}/${yyyy}`;
            }
        }

        const dateObj = new Date(dateStr);
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return dateStr;
        }
        // Using existing helper and replacing - with /
        return formatDateDDMMYYYY(dateObj).replace(/-/g, '/');
    } catch (e) {
        return dateStr;
    }
};

/**
 * Generic validation for required fields.
 */
export const validateRequired = (value: string, fieldName: string): string => {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return `${fieldName} is mandatory.`;
    }
    return '';
};
/**
 * Validates a Canadian Postal Code.
 * Format: A1B 2C3
 */
export const validateCanadianPostalCode = (value: string): string => {
    if (!value || value.trim().length === 0) {
        return 'Postal code is mandatory.';
    }
    const normalized = value.trim().toUpperCase();
    // Regex for A1B 2C3 or A1B2C3
    const regex = /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/;
    if (!regex.test(normalized)) {
        return 'Please enter a valid Canadian postal code (e.g., A1B 2C3).';
    }
    return '';
};

/**
 * Validates a City name.
 */
export const validateCity = (value: string): string => {
    if (!value || value.trim().length === 0) {
        return 'City is mandatory.';
    }
    if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) {
        return 'City should only contain alphabets.';
    }
    if (value.trim().length < 2) {
        return 'City name is too short.';
    }
    return '';
};

/**
 * Validates that the user is at least 18 years old.
 */
export const validateAge18 = (dobDate: Date): string => {
    if (!dobDate) return 'Date of Birth is mandatory.';

    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }

    if (age < 18) {
        return 'You must be at least 18 years old.';
    }
    return '';
};

export const sanitizeAlphabets = (value: string): string => {
    return (value || '').replace(/[^a-zA-Z\s]/g, '');
};

export const sanitizeAlphanumeric = (value: string): string => {
    return (value || '').replace(/[^a-zA-Z0-9\s]/g, '');
};

/**
 * Sanitizes input to allow only valid decimal numbers with up to one decimal point.
 * Optionally handles currency prefix removal if a currency string is provided.
 */
export const sanitizeDecimalInput = (text: string, currencySymbol: string = '', decimalPlaces: number = 3): string => {
    let rawText = text;
    if (currencySymbol) {
        rawText = text.replace(currencySymbol, '');
    }
    const sanitized = rawText.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');

    let cleanText = parts[0];
    if (parts.length > 1) {
        cleanText += '.' + parts[1].slice(0, decimalPlaces);
    }
    return cleanText;
};
