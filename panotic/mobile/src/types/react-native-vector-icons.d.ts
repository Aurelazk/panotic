declare module 'react-native-vector-icons/Ionicons' {
  import { IconProps } from 'react-native-vector-icons/Icon';
  import * as React from 'react';
  class Ionicons extends React.Component<IconProps, any> {}
  export default Ionicons;
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { IconProps } from 'react-native-vector-icons/Icon';
  import * as React from 'react';
  class MaterialCommunityIcons extends React.Component<IconProps, any> {}
  export default MaterialCommunityIcons;
}

declare var __DEV__: boolean;
