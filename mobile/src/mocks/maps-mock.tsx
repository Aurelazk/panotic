import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { View } from 'react-native';

// Mock values and providers
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

// Helper to dynamically load Leaflet from CDN to avoid Metro bundler issues
function loadLeaflet(callback: () => void) {
  if ((window as any).L) {
    callback();
    return;
  }

  // Load CSS
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  // Load JS
  if (!document.getElementById('leaflet-js')) {
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => callback();
    document.body.appendChild(script);
  } else {
    // If script tag exists but window.L is not yet ready, poll briefly
    const interval = setInterval(() => {
      if ((window as any).L) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }
}

// Named mock exports that mimic react-native-maps elements
export const Marker = ({ children }: any) => <div className="mock-marker">{children}</div>;
export const Callout = ({ children }: any) => <div className="mock-callout">{children}</div>;
export const Polygon = () => null;
export const Heatmap = () => null;
export const UrlTile = () => null;

// Functional MapView with Leaflet integration
const MapView = forwardRef(({ style, initialRegion, children, mapType }: any, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const layersRef = useRef<any[]>([]);
  const rootsRef = useRef<any[]>([]);

  // Expose standard animateToRegion method to components using refs
  useImperativeHandle(ref, () => ({
    animateToRegion: (region: any, duration?: number) => {
      if (mapInstanceRef.current && region) {
        mapInstanceRef.current.setView([region.latitude, region.longitude], 15, {
          animate: true,
          duration: duration ? duration / 1000 : 1,
        });
      }
    },
  }));

  // Load Leaflet resources dynamically on mount
  useEffect(() => {
    loadLeaflet(() => {
      setLeafletLoaded(true);
    });
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !containerRef.current || mapInstanceRef.current) return;

    const lat = initialRegion?.latitude ?? 6.3653;
    const lng = initialRegion?.longitude ?? 2.4183;
    const zoom = 13;

    const L = (window as any).L;
    const map = L.map(containerRef.current, {
      zoomControl: true,
    }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Synchronize and render children elements (Markers, Polygons, Heatmaps)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const L = (window as any).L;

    // Clear previous layers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    // Clean up ReactDOM roots to avoid memory leaks
    rootsRef.current.forEach(root => root.unmount());
    rootsRef.current = [];

    // Helper to process children components recursively
    const processChild = (child: any) => {
      if (!child || !child.props) return;

      const typeName = child.type?.name || '';
      
      // 1. Process Marker
      if (child.props.coordinate) {
        const { coordinate, children: markerChildren } = child.props;
        const lat = coordinate.latitude;
        const lng = coordinate.longitude;

        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        let customGraphic: any = null;
        let calloutChild: any = null;

        React.Children.forEach(markerChildren, (mc: any) => {
          if (!mc) return;
          if (mc.props && mc.props.tooltip !== undefined) {
            calloutChild = mc;
          } else {
            customGraphic = mc;
          }
        });

        let markerOptions: any = {};

        // Render custom graphics to L.divIcon using createRoot
        if (customGraphic) {
          const iconEl = document.createElement('div');
          iconEl.style.display = 'inline-block';
          iconEl.style.position = 'relative';

          const root = createRoot(iconEl);
          root.render(customGraphic);
          rootsRef.current.push(root);

          markerOptions.icon = L.divIcon({
            html: iconEl,
            className: 'custom-leaflet-marker-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });
        }

        const marker = L.marker([lat, lng], markerOptions).addTo(map);
        layersRef.current.push(marker);

        // Render popup callout
        if (calloutChild) {
          const popupEl = document.createElement('div');
          popupEl.style.minWidth = '220px';

          const root = createRoot(popupEl);
          root.render(calloutChild);
          rootsRef.current.push(root);

          marker.bindPopup(popupEl, {
            closeButton: false,
            className: 'custom-leaflet-popup',
          });

          if (calloutChild.props.onPress) {
            marker.on('popupopen', () => {
              popupEl.onclick = () => {
                calloutChild.props.onPress();
              };
            });
          }
        }
      }

      // 2. Process Polygon
      else if (child.props.coordinates) {
        const { coordinates, fillColor, strokeColor, strokeWidth, onPress } = child.props;
        if (!Array.isArray(coordinates)) return;

        const latlngs = coordinates.map((c: any) => [c.latitude, c.longitude]);
        const polygon = L.polygon(latlngs, {
          color: strokeColor || '#000',
          weight: strokeWidth || 2,
          fillColor: fillColor || '#3388ff',
          fillOpacity: 0.4,
        }).addTo(map);

        layersRef.current.push(polygon);

        if (onPress) {
          polygon.on('click', (e: any) => {
            onPress(e);
          });
        }
      }

      // 3. Process Heatmap
      else if (child.props.points) {
        const { points, radius } = child.props;
        if (!Array.isArray(points)) return;

        points.forEach((pt: any) => {
          const lat = pt.latitude || pt.lat;
          const lng = pt.longitude || pt.lng;
          const weight = pt.weight || 1;

          if (typeof lat !== 'number' || typeof lng !== 'number') return;

          const circle = L.circle([lat, lng], {
            radius: (radius || 40) * 1.5,
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.15 * weight,
            stroke: false,
          }).addTo(map);

          layersRef.current.push(circle);
        });
      }
    };

    // Traverse all children inside MapView
    React.Children.forEach(children, (child: any) => {
      if (!child) return;

      if (child.type === React.Fragment) {
        React.Children.forEach(child.props.children, processChild);
      } else {
        processChild(child);
      }
    });

  }, [children, leafletLoaded]);

  // Synchronize Map Layers (Standard OpenStreetMap vs Satellite ESRI Tile layer)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !leafletLoaded) return;

    const L = (window as any).L;

    // Remove existing OSM or Satellite layer
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === 'satellite' || mapType === 'hybrid') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
    }
  }, [mapType, leafletLoaded]);

  const containerStyle: any = {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    ...(style || {}),
  };

  return (
    <View ref={containerRef as any} style={containerStyle}>
      {!leafletLoaded && (
        <View style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#4b5563', fontFamily: 'sans-serif' }}>
            Chargement de la carte OpenStreetMap...
          </span>
        </View>
      )}
    </View>
  );
});

export default MapView;
