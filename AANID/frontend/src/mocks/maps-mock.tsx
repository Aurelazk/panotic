import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { View, Text } from 'react-native';

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

function loadLeaflet(callback) {
  if (window.L) {
    callback();
    return;
  }
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  if (!document.getElementById('leaflet-js')) {
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => callback();
    document.body.appendChild(script);
  } else {
    const interval = setInterval(() => {
      if (window.L) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }
}

export const Marker = ({ children }) => <>{children}</>;
export const Callout = ({ children }) => <>{children}</>;
export const Polygon = () => null;
export const Polyline = () => null;
export const Circle = () => null;
export const Geojson = () => null;
export const Heatmap = () => null;
export const UrlTile = () => null;

const MapView = forwardRef(({ style, initialRegion, children, mapType }, ref) => {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const layersRef = useRef([]);
  const rootsRef = useRef([]);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => {
      if (mapInstanceRef.current && region) {
        mapInstanceRef.current.setView([region.latitude, region.longitude], 15, {
          animate: true, duration: duration ? duration / 1000 : 1,
        });
      }
    },
  }));

  useEffect(() => {
    loadLeaflet(() => setLeafletLoaded(true));
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !containerRef.current || mapInstanceRef.current) return;
    const lat = initialRegion?.latitude ?? 6.3653;
    const lng = initialRegion?.longitude ?? 2.4183;
    const map = window.L.map(containerRef.current, { zoomControl: true }).setView([lat, lng], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    mapInstanceRef.current = map;
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];
    rootsRef.current.forEach(root => root.unmount());
    rootsRef.current = [];

    const processChild = (child) => {
      if (!child || !child.props) return;
      if (child.props.coordinate) {
        const { coordinate, children: markerChildren } = child.props;
        const lat = coordinate.latitude;
        const lng = coordinate.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;
        let customGraphic = null;
        let calloutChild = null;
        React.Children.forEach(markerChildren, (mc) => {
          if (!mc) return;
          if (mc.props && mc.props.tooltip !== undefined) calloutChild = mc;
          else customGraphic = mc;
        });
        let markerOptions = {};
        if (customGraphic) {
          const iconEl = document.createElement('div');
          iconEl.style.display = 'inline-block';
          iconEl.style.position = 'relative';
          const root = createRoot(iconEl);
          root.render(customGraphic);
          rootsRef.current.push(root);
          markerOptions.icon = window.L.divIcon({
            html: iconEl, className: 'custom-leaflet-marker-icon',
            iconSize: [36, 36], iconAnchor: [18, 18],
          });
        }
        const marker = window.L.marker([lat, lng], markerOptions).addTo(map);
        layersRef.current.push(marker);
        if (calloutChild) {
          const popupEl = document.createElement('div');
          popupEl.style.minWidth = '220px';
          const root = createRoot(popupEl);
          root.render(calloutChild);
          rootsRef.current.push(root);
          marker.bindPopup(popupEl, { closeButton: false, className: 'custom-leaflet-popup' });
          if (calloutChild.props.onPress) {
            marker.on('popupopen', () => {
              popupEl.onclick = () => calloutChild.props.onPress();
            });
          }
        }
      } else if (child.props.coordinates) {
        const { coordinates, fillColor, strokeColor, strokeWidth, onPress } = child.props;
        if (!Array.isArray(coordinates)) return;
        const latlngs = coordinates.map(c => [c.latitude, c.longitude]);
        const polygon = window.L.polygon(latlngs, {
          color: strokeColor || '#000', weight: strokeWidth || 2,
          fillColor: fillColor || '#3388ff', fillOpacity: 0.4,
        }).addTo(map);
        layersRef.current.push(polygon);
        if (onPress) polygon.on('click', onPress);
      } else if (child.props.points) {
        const { points, radius } = child.props;
        if (!Array.isArray(points)) return;
        points.forEach(pt => {
          const lat = pt.latitude || pt.lat;
          const lng = pt.longitude || pt.lng;
          const weight = pt.weight || 1;
          if (typeof lat !== 'number' || typeof lng !== 'number') return;
          const circle = window.L.circle([lat, lng], {
            radius: (radius || 40) * 1.5, color: 'red',
            fillColor: '#f03', fillOpacity: 0.15 * weight, stroke: false,
          }).addTo(map);
          layersRef.current.push(circle);
        });
      }
    };

    React.Children.forEach(children, (child) => {
      if (!child) return;
      if (child.type === React.Fragment) {
        React.Children.forEach(child.props.children, processChild);
      } else {
        processChild(child);
      }
    });
  }, [children, leafletLoaded]);

  return (
    <View ref={containerRef} style={{ width: '100%', height: '100%', ...(style || {}) }}>
      {!leafletLoaded && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Chargement de la carte...</Text>
        </View>
      )}
    </View>
  );
});

export default MapView;
