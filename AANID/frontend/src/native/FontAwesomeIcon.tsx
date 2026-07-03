import React from 'react';
import { Platform, Text, StyleProp, TextStyle } from 'react-native';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

type Props = {
  icon: IconProp;
  size?: number;
  color?: string;
  style?: { fontSize?: number; color?: string };
};

const FONT_BY_PREFIX: Record<string, string> = {
  fas: 'FontAwesome6_Solid',
  far: 'FontAwesome6_Regular',
  fab: 'FontAwesome6_Brands',
};

function extractGlyph(icon: IconProp): { char: string; fontFamily: string } | null {
  if (!icon || typeof icon !== 'object') return null;

  const prefix = 'prefix' in icon ? String(icon.prefix) : 'fas';
  const fontFamily = FONT_BY_PREFIX[prefix] || FONT_BY_PREFIX.fas;

  if ('icon' in icon && Array.isArray(icon.icon) && icon.icon[3]) {
    const codePoint = parseInt(String(icon.icon[3]), 16);
    if (!Number.isNaN(codePoint)) {
      return { char: String.fromCodePoint(codePoint), fontFamily };
    }
  }

  return null;
}

/** Remplacement natif de @fortawesome/react-fontawesome (web/DOM uniquement). */
export function FontAwesomeIcon({ icon, size, color, style }: Props) {
  const resolvedSize = size ?? style?.fontSize ?? 16;
  const resolvedColor = color ?? style?.color ?? '#2E2A24';
  const glyph = extractGlyph(icon);

  if (!glyph) {
    return <Text style={{ fontSize: resolvedSize, color: resolvedColor }}>•</Text>;
  }

  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: glyph.fontFamily,
          fontSize: resolvedSize,
          color: resolvedColor,
          textAlign: 'center',
          ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' as const } : {}),
        },
        style as StyleProp<TextStyle>,
      ]}
    >
      {glyph.char}
    </Text>
  );
}

export default FontAwesomeIcon;
