import React, { ReactNode } from 'react';

export class MockComponent extends React.Component<{ children?: ReactNode }> {
  render() {
    return <>{this.props.children}</>;
  }
}

// Safe Area exports
export const SafeAreaProvider = MockComponent;
export const SafeAreaView = MockComponent;
export const SafeAreaConsumer = ({ children }: any) => children({ top: 0, left: 0, right: 0, bottom: 0 });
export const useSafeAreaInsets = () => ({ top: 0, left: 0, right: 0, bottom: 0 });
export const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 0, height: 0 });
export const initialWindowMetrics = { frame: { x: 0, y: 0, width: 0, height: 0 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
import { createContext } from 'react';

const defaultInsets = { top: 0, left: 0, right: 0, bottom: 0 };
const defaultFrame = { x: 0, y: 0, width: 0, height: 0 };

export const SafeAreaInsetsContext = createContext(defaultInsets);
export const SafeAreaFrameContext = createContext(defaultFrame);

// Vector Icons
export const createIconSet = () => MockComponent;

// Image Picker
export const launchImageLibrary = async () => ({ didCancel: true });
export const launchCamera = async () => ({ didCancel: true });

// Keychain - in-memory storage for web mock
let keychainStorage: { username: string; password: string } | null = null;
export const getGenericPassword = async () => keychainStorage;
export const setGenericPassword = async (username: string, password: string) => {
  keychainStorage = { username, password };
  return true;
};
export const resetGenericPassword = async () => {
  keychainStorage = null;
  return true;
};

export default MockComponent;
