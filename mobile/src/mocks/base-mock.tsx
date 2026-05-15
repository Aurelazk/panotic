import React from 'react';

export class MockComponent extends React.Component {
  render() {
    return <>{this.props.children}</>;
  }
}

// Safe Area exports
export const SafeAreaProvider = MockComponent;
export const SafeAreaView = MockComponent;
export const SafeAreaConsumer = ({ children }) => children({ top: 0, left: 0, right: 0, bottom: 0 });
export const useSafeAreaInsets = () => ({ top: 0, left: 0, right: 0, bottom: 0 });
export const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 0, height: 0 });
export const initialWindowMetrics = { frame: { x: 0, y: 0, width: 0, height: 0 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
export const SafeAreaInsetsContext = { Consumer: ({ children }) => children({ top: 0, left: 0, right: 0, bottom: 0 }) };
export const SafeAreaFrameContext = { Consumer: ({ children }) => children({ x: 0, y: 0, width: 0, height: 0 }) };

// Vector Icons
export const createIconSet = () => MockComponent;

// Image Picker
export const launchImageLibrary = async () => ({ didCancel: true });
export const launchCamera = async () => ({ didCancel: true });

// Keychain
export const getGenericPassword = async () => null;
export const setGenericPassword = async () => null;
export const resetGenericPassword = async () => null;

export default MockComponent;
