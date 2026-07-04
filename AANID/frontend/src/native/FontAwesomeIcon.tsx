import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';

type Props = {
  icon: IconProp;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle> & { fontSize?: number; color?: string };
};

function styleFlags(prefix: string | undefined) {
  if (prefix === 'fab') return { brand: true as const };
  if (prefix === 'far') return { regular: true as const };
  return { solid: true as const };
}

/** Remplacement natif de @fortawesome/react-fontawesome (web/DOM uniquement). */
export function FontAwesomeIcon({ icon, size, color, style }: Props) {
  const resolvedSize = size ?? (typeof style === 'object' && style && 'fontSize' in style ? style.fontSize : 16) ?? 16;
  const resolvedColor =
    color ?? (typeof style === 'object' && style && 'color' in style ? style.color : undefined) ?? '#2E2A24';

  const iconName =
    icon && typeof icon === 'object' && 'iconName' in icon ? String(icon.iconName) : null;
  const prefix = icon && typeof icon === 'object' && 'prefix' in icon ? String(icon.prefix) : 'fas';

  if (!iconName) {
    return <View style={style as StyleProp<ViewStyle>} />;
  }

  return (
    <View style={style as StyleProp<ViewStyle>}>
      <FA6Icon
        name={iconName}
        size={resolvedSize}
        color={resolvedColor}
        {...styleFlags(prefix)}
      />
    </View>
  );
}

export default FontAwesomeIcon;
