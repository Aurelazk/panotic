import React from 'react';

export class MockComponent extends React.Component {
  render() {
    return <div style={{ backgroundColor: '#e0e0e0', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#666' }}>Carte Simulée</span>
      {this.props.children}
    </div>;
  }
}

export const Marker = MockComponent;
export const Callout = MockComponent;
export const Polygon = MockComponent;
export const Polyline = MockComponent;
export const Circle = MockComponent;
export const Heatmap = MockComponent;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export default MockComponent;
