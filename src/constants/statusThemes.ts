import strings from './strings';
import Colors from '@styles/colors';

export const STATUS_THEMES: Record<string, { bg: string; text: string }> = {
  [strings.common.paid]: { bg: Colors.paidBg, text: Colors.green },
  [strings.common.pending]: { bg: Colors.pendingBg, text: Colors.pending },
  [strings.common.failed]: { bg: Colors.failedBg, text: Colors.red },
};
