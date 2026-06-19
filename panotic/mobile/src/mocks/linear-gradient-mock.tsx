import React from 'react';
import { View } from 'react-native';

const LinearGradient = ({ children, colors, style, ...props }: any) => {
  const backgroundColor = colors?.[0] || 'transparent';
  return <View style={[{ backgroundColor }, style]}>{children}</View>;
};

export default LinearGradient;