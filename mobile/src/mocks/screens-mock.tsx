import React from 'react';

export class MockScreenContainer extends React.Component {
  render() {
    return <div style={{ flex: 1, height: '100%' }}>{this.props.children}</div>;
  }
}

export const ScreenContainer = MockScreenContainer;
export const Screen = MockScreenContainer;
export const MaybeScreenContainer = MockScreenContainer;
export const enableScreens = () => {};
export const shouldUseActivityState = () => true;

export default {
  ScreenContainer,
  Screen,
  MaybeScreenContainer,
  enableScreens,
  shouldUseActivityState,
};
