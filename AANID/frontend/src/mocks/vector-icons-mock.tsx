import React from 'react';
import { Text, View } from 'react-native';

const ICON_MAP: Record<string, string> = {
  grid: '⊞', 'grid-outline': '⊞',
  map: '🗺', 'map-outline': '🗺',
  chatbubbles: '💬', 'chatbubbles-outline': '💬',
  school: '🎓', 'school-outline': '🎓',
  megaphone: '📢', 'megaphone-outline': '📢',
  'add-circle': '⊕', 'add-circle-outline': '⊕',
  'person-circle': '👤', 'person-circle-outline': '👤',
  'log-out-outline': '⏻',
  'chevron-forward': '›',
  'shield-checkmark': '✓', 'shield-checkmark-outline': '✓',
  'person-outline': '👤',
  'card-outline': '💳',
  'notifications-outline': '🔔',
  'lock-closed-outline': '🔒',
  'help-circle-outline': '?', 'help-circle': '?',
  'arrow-back': '←',
  'checkmark-circle': '✓',
  'camera': '📷',
  diamond: '◆',
  'eye-outline': '👁',
  'notifications-off-outline': '🔕',
  'location-outline': '📍',
  'trash-outline': '🗑',
  'mail-outline': '✉',
  'call-outline': '📞',
  'help-circle-outline': '?',
  'newspaper-outline': '📰',
  'notifications-off-outline': '🔕',
};

export default function Icon({ name, size, color }: { name: string; size?: number; color?: string }) {
  const icon = ICON_MAP[name] || '•';
  return (
    <Text style={{ fontSize: size || 24, color: color || '#000', textAlign: 'center' }}>
      {icon}
    </Text>
  );
}
