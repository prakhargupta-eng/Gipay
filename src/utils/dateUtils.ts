// src/utils/dateUtils.ts
import strings from '@constants/strings';
import * as RNLocalize from 'react-native-localize';
import moment from 'moment-timezone';
import { devDebugger } from '@utils/devDebugger';

export const isCanadaUser = (): boolean => {
  const country = RNLocalize.getCountry();
  if (country === 'CA') return true;

  const timezone = (RNLocalize.getTimeZone() || Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
  return (
    timezone.startsWith('america/') &&
    [
      'toronto', 'vancouver', 'edmonton', 'winnipeg', 'halifax', 'st_johns', 'regina', 
      'moncton', 'yellowknife', 'whitehorse', 'dawson', 'swift_current', 'iqaluit'
    ].some(city => timezone.includes(city))
  );
};

export const formatDate = (dateString: string | Date) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const isCanada = isCanadaUser();
  return isCanada ? `${year}-${month}-${day}` : `${day}/${month}/${year}`;
};

export const formatLocalDateString = (dateStr?: string | Date): string => {
  if (!dateStr) return 'N/A';
  const isCanada = isCanadaUser();
  if (dateStr instanceof Date) {
    const day = String(dateStr.getDate()).padStart(2, '0');
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const year = dateStr.getFullYear();
    return isCanada ? `${year}-${month}-${day}` : `${day}/${month}/${year}`;
  }

  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanDateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const [year, month, day] = parts;
      return isCanada ? `${year}-${month}-${day}` : `${day}/${month}/${year}`;
    }
    if (parts[2].length === 4) {
      const [p0, p1, year] = parts;
      const formattedP0 = p0.padStart(2, '0');
      const formattedP1 = p1.padStart(2, '0');
      return isCanada ? `${year}-${formattedP1}-${formattedP0}` : `${formattedP0}/${formattedP1}/${year}`;
    }
  }
  return dateStr;
};



export const parseTimeString = (timeStr: string) => {
  if (!timeStr) return null;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  let hoursInt = parseInt(hours, 10);
  const minutesInt = parseInt(minutes, 10);

  if (modifier === 'PM' && hoursInt < 12) {
    hoursInt += 12;
  }
  if (modifier === 'AM' && hoursInt === 12) {
    hoursInt = 0;
  }

  const date = new Date();
  date.setHours(hoursInt, minutesInt, 0, 0);
  return date;
};

export const formatTime = (dateString?: string | Date, isUTC: boolean = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  let hours = isUTC ? date.getUTCHours() : date.getHours();
  const minutes = String(isUTC ? date.getUTCMinutes() : date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
};

export const getTimeAgo = (dateString?: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

export const checkClockInEligibility = (startDateStr?: string | Date, endDateStr?: string | Date, mode?: string): string | null => {
  if (!startDateStr || !endDateStr) return null;
  if (mode && mode.toLowerCase().replace(/\s+/g, '') !== 'clockin') {
    return null;
  }
  const now = new Date();
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  devDebugger.log(startDate.toISOString(), 'stat TimeUnit', endDate.toISOString(), 'endDateTimeUnit');
  devDebugger.log(now.toISOString(), 'now time unit');
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

  // 1. Check absolute bounds (is the job completely over or way in the future?)
  const earliestAllowedTime = startDate.getTime() - TWO_HOURS_MS;

  if (now.getTime() < earliestAllowedTime) {
    return strings.auth.contractor.home.clockInOutPopup.notTimeYet;
  }

  if (now.getTime() > endDate.getTime()) {
    return strings.auth.contractor.home.clockInOutPopup.windowClosed;
  }

  // 2. Daily access window check for multi-day jobs running strictly in UTC
  const todayStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    startDate.getUTCHours(),
    startDate.getUTCMinutes(),
    startDate.getUTCSeconds(),
    0
  ));

  const todayEnd = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    endDate.getUTCHours(),
    endDate.getUTCMinutes(),
    endDate.getUTCSeconds(),
    0
  ));

  // Handle overnight shifts (e.g. 10 PM to 6 AM UTC)
  if (todayEnd.getTime() < todayStart.getTime()) {
    if (now.getUTCHours() <= endDate.getUTCHours() + 2) {
      todayStart.setUTCDate(todayStart.getUTCDate() - 1);
    } else {
      todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
    }
  }

  // Apply the 2 hour margin to today's shift window
  const accessStart = todayStart.getTime() - TWO_HOURS_MS;

  if (now.getTime() < accessStart) {
    return strings.auth.contractor.home.clockInOutPopup.notTimeYet;
  }

  if (now.getTime() > todayEnd.getTime()) {
    // Check if tomorrow's shift is still within the absolute job period
    const tomorrowStart = todayStart.getTime() + 24 * 60 * 60 * 1000;
    if (tomorrowStart < endDate.getTime()) {
      return strings.auth.contractor.home.clockInOutPopup.clockInTomorrow;
    } else {
      return strings.auth.contractor.home.clockInOutPopup.windowClosed;
    }
  }

  return null;
};

export const getCurrentTimeZone = (): string => {
  const timeZone = RNLocalize.getTimeZone();
  const zone = moment.tz.zone(timeZone);
  return zone?.name || timeZone;
};

export const getLocalDateTime = (utcDate?: string | Date) => {
  if (!utcDate) {
    return {
      date: 'N/A',
      time: 'N/A',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  let date = new Date(utcDate);
  if (isNaN(date.getTime()) && typeof utcDate === 'string') {
    const cleanDateStr = utcDate.includes('T') ? utcDate.split('T')[0] : utcDate;
    const parts = cleanDateStr.trim().split(/[-/]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD/MM/YYYY
        const [d, m, y] = parts.map(Number);
        const candidate = new Date(y, m - 1, d);
        if (!isNaN(candidate.getTime())) {
          date = candidate;
        }
      } else if (parts[0].length === 4) {
        // YYYY/MM/DD
        const [y, m, d] = parts.map(Number);
        const candidate = new Date(y, m - 1, d);
        if (!isNaN(candidate.getTime())) {
          date = candidate;
        }
      }
    }
  }

  if (isNaN(date.getTime())) {
    return {
      date: 'N/A',
      time: 'N/A',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  const isCanada = isCanadaUser();
  const formattedDate = isCanada
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : date.toLocaleDateString('en-GB');

  return {
    date: formattedDate,
    time: date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

export const parseDOBToLocalDate = (dobInput?: string | Date): Date => {
  if (!dobInput) return new Date();
  if (dobInput instanceof Date) return dobInput;

  const cleanDateStr = dobInput.includes('T') ? dobInput.split('T')[0] : dobInput;
  const parts = cleanDateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const [year, month, day] = parts.map(Number);
      return new Date(year, month - 1, day);
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY or MM-DD-YYYY
      const [p0, p1, year] = parts.map(Number);
      return new Date(year, p1 - 1, p0);
    }
  }
  const d = new Date(dobInput);
  return isNaN(d.getTime()) ? new Date() : d;
};

export const formatDOBLocally = (dobInput?: string | Date): string => {
  if (!dobInput) return '';
  const dateObj = parseDOBToLocalDate(dobInput);
  const isCanada = isCanadaUser();
  if (isCanada) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return dateObj.toLocaleDateString();
};

/**
 * Checks if two dates fall on the same calendar day
 */
export const isSameDay = (date1?: string | Date | null, date2?: string | Date | null): boolean => {
  if (!date1 || !date2) return false;
  try {
    const m1 = moment(date1);
    const m2 = moment(date2);
    if (m1.isValid() && m2.isValid()) {
      return m1.isSame(m2, 'day');
    }
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    }
  } catch {
    return false;
  }
  return false;
};



