import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

const C = {
  bleu: '#C19A6B', vert: '#6E8B5B', orange: '#D9A441',
  rouge: '#C75D4F', noir: '#2E2A24', gris: '#A89E90',
  grisClair: '#F2E7D3', blanc: '#FFFFFF',
};

const MIN_W = 420;
const MAX_W = 1200;

function useT() {
  const { width } = useWindowDimensions();
  return Math.max(0, Math.min(1, (width - MIN_W) / (MAX_W - MIN_W)));
}

function useFluid() {
  const t = useT();
  return (a, b) => Math.round(a + (b - a) * t);
}

function useIsMobile() {
  const { width } = useWindowDimensions();
  return width < 640;
}

function api(e) { return fetch(`/api/v1${e}`).then(r => r.json()); }

const shadow = { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 };
const badgS = { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, flexShrink: 0 };

function formatNb(n) {
  if (n == null) return '—';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function SvgChevron() {
  return (
    <View style={{ width: 10, height: 6, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 7, height: 7, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#9b9b9b', transform: [{ rotate: '-45deg' }], marginTop: -3 }} />
    </View>
  );
}

// ─── Desktop FilterBox ──────────────────────────────────────────────────────
function FilterBox({ label, value, f }) {
  return (
    <View style={{ backgroundColor: C.blanc, borderRadius: 8, paddingVertical: f(8, 8), paddingHorizontal: f(12, 14), minWidth: f(130, 150), ...shadow }}>
      <Text style={{ fontSize: f(10.5, 11), color: '#8a8a8a', marginBottom: 2 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: f(12, 13), fontWeight: 'bold', color: C.noir }}>{value}</Text>
        <SvgChevron />
      </View>
    </View>
  );
}

// ─── Mobile FilterChip ──────────────────────────────────────────────────────
function FilterChip({ label, active, icon }) {
  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: active ? C.rouge : C.blanc, borderRadius: 999,
      paddingHorizontal: 13, paddingVertical: 7, marginRight: 8,
      ...shadow, shadowOpacity: active ? 0 : undefined, shadowRadius: active ? 0 : undefined,
    }]}>
      {icon && typeof icon === 'string' && icon !== 'geo' && <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: icon }} />}
      {icon === 'geo' && (
        <View style={{ width: 9, height: 9, borderRadius: 4.5, borderWidth: 1.8, borderColor: active ? C.blanc : C.noir }} />
      )}
      <Text style={{ fontSize: 11.5, fontWeight: 'bold', color: active ? C.blanc : C.noir }}>{label}</Text>
    </View>
  );
}

// ─── SVG-style Icons ────────────────────────────────────────────────────────
function IconScreen({ color, sz }) {
  const s = sz || 16;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: s, height: s * 0.69, borderRadius: 1.5, borderWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: -0.5, width: s * 0.35, height: s * 0.25, borderRadius: 999, backgroundColor: color }} />
    </View>
  );
}
function IconWarning({ color, sz }) {
  const s = sz || 16;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.35, borderRightWidth: s * 0.35, borderBottomWidth: s * 0.7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
      <View style={{ position: 'absolute', top: s * 0.15, width: 1.5, height: s * 0.2, backgroundColor: C.blanc }} />
    </View>
  );
}
function IconPin({ color, sz }) {
  const s = sz || 16;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: s * 0.65, height: s * 0.65, borderRadius: s * 0.325, borderWidth: 1.8, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 1, width: 1.5, height: s * 0.3, backgroundColor: color }} />
    </View>
  );
}
function IconCheck({ color, sz }) {
  const s = sz || 16;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: s * 0.7, height: s * 0.7, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: color, transform: [{ rotate: '-45deg' }], marginTop: -3 }} />
    </View>
  );
}
function IconPlus() {
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 14, height: 2.4, borderRadius: 1.2, backgroundColor: C.blanc }} />
      <View style={{ position: 'absolute', width: 2.4, height: 14, borderRadius: 1.2, backgroundColor: C.blanc }} />
    </View>
  );
}
function IconBell() {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 14, height: 11, borderRadius: 3, borderWidth: 1.8, borderColor: C.noir }} />
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.noir, marginTop: 2 }} />
    </View>
  );
}
function IconCamera() {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 20, height: 15, borderRadius: 3, borderWidth: 2, borderColor: C.blanc }} />
      <View style={{ position: 'absolute', top: 3, width: 6, height: 6, borderRadius: 3, backgroundColor: C.blanc }} />
    </View>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, delta, direction, foot, iconBg, children, compact, f }) {
  if (compact) {
    return (
      <View style={{ backgroundColor: C.blanc, borderRadius: 8, padding: f(12, 14), minWidth: f(110, 128), flexShrink: 0, ...shadow }}>
        <View style={{ width: f(22, 26), height: f(22, 26), borderRadius: 7, backgroundColor: iconBg, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>{children}</View>
        <Text style={{ fontSize: f(9.5, 10.5), color: '#6b6b6b', marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontSize: f(19, 22), fontWeight: 'bold', lineHeight: f(19, 22) }}>{value}</Text>
        <Text style={{ fontSize: f(9.5, 10.5), fontWeight: 'bold', marginTop: 5, color: direction === 'up' ? C.vert : C.rouge }}>
          {direction === 'up' ? '↑' : '↓'} {delta}%
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, minWidth: f(200, 240), backgroundColor: C.blanc, borderRadius: 8, padding: f(16, 18), ...shadow }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: f(12, 14) }}>
        <Text style={{ fontSize: f(12, 13), color: '#6b6b6b' }}>{label}</Text>
        <View style={{ width: f(26, 30), height: f(26, 30), borderRadius: 7, backgroundColor: iconBg, justifyContent: 'center', alignItems: 'center' }}>{children}</View>
      </View>
      <Text style={{ fontSize: f(26, 30), fontWeight: 'bold', lineHeight: f(26, 30) }}>{value}</Text>
      <Text style={{ fontSize: f(11, 12), fontWeight: 'bold', marginTop: 6, color: direction === 'up' ? C.vert : C.rouge }}>
        {direction === 'up' ? '↑' : '↓'} {delta}%{' '}
        <Text style={{ color: '#9b9b9b', fontWeight: 'normal' }}>ce mois</Text>
      </Text>
      <Text style={{ fontSize: f(10, 11), color: '#9b9b9b', marginTop: 6 }}>{foot}</Text>
    </View>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────
function Panel({ title, tag, link, children, topPad, f }) {
  return (
    <View style={{ backgroundColor: C.blanc, borderRadius: 8, padding: f(16, 20), ...shadow }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir, flex: 1 }}>{title}</Text>
        {tag && <View style={{ backgroundColor: C.grisClair, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, marginLeft: 8 }}><Text style={{ fontSize: f(10, 11), color: '#6b6b6b' }}>{tag}</Text></View>}
        {link && <Text style={{ fontSize: f(11, 11.5), color: C.bleu, fontWeight: 'bold', marginLeft: 8 }}>{link}</Text>}
      </View>
      {topPad != null && <View style={{ marginTop: topPad }} />}
      {children}
    </View>
  );
}

// ─── Legend ──────────────────────────────────────────────────────────────────
function Legend({ items, f, noMb }) {
  return (
    <View style={{ flexDirection: 'row', gap: f(12, 18), marginTop: 8, marginBottom: noMb ? 0 : f(4, 14), flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: f(5, 6) }}>
          <View style={{ width: f(7, 9), height: f(7, 9), borderRadius: f(3.5, 4.5), backgroundColor: item.color }} />
          <Text style={{ fontSize: f(10, 12), color: '#6b6b6b' }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Chart ───────────────────────────────────────────────────────────────────
function Chart({ f, t, compact }) {
  const h = Math.round(f(140, 230));
  const gridTop = 10 + (1 - t) * 8;
  const bottomPad = 30 - (1 - t) * 10;
  return (
    <View>
      <Legend items={[
        { color: C.vert, label: compact ? 'Modernes' : 'Panneaux modernes' },
        { color: C.orange, label: compact ? 'Obsolètes' : 'Panneaux obsolètes' },
        { color: C.rouge, label: compact ? 'Signalements' : 'Signalements cumulés' },
      ]} f={f} noMb={compact} />
      <View style={{ width: '100%', height: h, position: 'relative' }}>
        <View style={{ position: 'absolute', left: compact ? 0 : 40, right: 0, top: gridTop, bottom: bottomPad }}>
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            {compact ? (
              <>
                <View style={{ height: 1, backgroundColor: '#f5f5f5' }} />
                <View style={{ height: 1, backgroundColor: '#f5f5f5' }} />
              </>
            ) : (
              <>
                <View style={{ height: 1, backgroundColor: '#f5f5f5' }} />
                <View style={{ height: 1, backgroundColor: '#f5f5f5' }} />
                <View style={{ height: 1, backgroundColor: '#f5f5f5' }} />
              </>
            )}
          </View>
        </View>
        {!compact && (
          <View style={{ position: 'absolute', left: 0, top: gridTop, width: 35 }}>
            <Text style={{ fontSize: 10, color: '#9b9b9b' }}>1200</Text>
            <View style={{ height: h / 4 - 4 }} />
            <Text style={{ fontSize: 10, color: '#9b9b9b' }}>900</Text>
            <View style={{ height: h / 4 - 4 }} />
            <Text style={{ fontSize: 10, color: '#9b9b9b' }}>600</Text>
            <View style={{ height: h / 4 - 4 }} />
            <Text style={{ fontSize: 10, color: '#9b9b9b' }}>300</Text>
          </View>
        )}
        <View style={{ position: 'absolute', left: compact ? 0 : 40, right: 0, top: h * 0.3, bottom: bottomPad, backgroundColor: C.vert, opacity: 0.15, borderTopLeftRadius: 20, borderTopRightRadius: f(30, 60) }} />
        <View style={{ position: 'absolute', left: compact ? 0 : 40, right: 0, top: h * 0.3, height: 1.5, backgroundColor: C.vert }} />
        <View style={{ position: 'absolute', left: '30%', right: 0, top: h * 0.24, height: 1.5, backgroundColor: C.vert }} />
        <View style={{ position: 'absolute', left: '65%', right: 0, top: h * 0.28, height: 1.5, backgroundColor: C.vert }} />
        <View style={{ position: 'absolute', left: compact ? '20%' : '8%', right: 0, top: h * 0.52, height: 1.2, backgroundColor: C.orange }} />
        <View style={{ position: 'absolute', left: '45%', right: 0, top: h * 0.48, height: 1.2, backgroundColor: C.orange }} />
        <View style={{ position: 'absolute', left: '75%', right: 0, top: h * 0.42, height: 1.2, backgroundColor: C.orange }} />
        <View style={{ position: 'absolute', left: compact ? '14%' : '5%', right: 0, top: h * 0.66, height: 1, backgroundColor: C.rouge }} />
        <View style={{ position: 'absolute', left: '48%', right: 0, top: h * 0.62, height: 1, backgroundColor: C.rouge }} />
        <View style={{ position: 'absolute', left: '82%', right: 0, top: h * 0.58, height: 1, backgroundColor: C.rouge }} />
        <View style={{ position: 'absolute', left: compact ? 0 : 38, bottom: bottomPad - 18, flexDirection: 'row', justifyContent: 'space-between', right: 10 }}>
          <Text style={{ fontSize: f(9, 10), color: '#9b9b9b' }}>J1</Text>
          <Text style={{ fontSize: f(9, 10), color: '#9b9b9b' }}>J8</Text>
          <Text style={{ fontSize: f(9, 10), color: '#9b9b9b' }}>J16</Text>
          <Text style={{ fontSize: f(9, 10), color: '#9b9b9b' }}>J23</Text>
          <Text style={{ fontSize: f(9, 10), color: '#9b9b9b' }}>J30</Text>
        </View>
        {!compact && (
          <>
            <View style={{ position: 'absolute', left: 40, top: gridTop, bottom: bottomPad, width: 1, backgroundColor: '#ececec' }} />
            <View style={{ position: 'absolute', left: 40, right: 0, bottom: bottomPad, height: 1, backgroundColor: '#ececec' }} />
          </>
        )}
      </View>
    </View>
  );
}

// ─── MiniMap ─────────────────────────────────────────────────────────────────
function MiniMap({ compact, f }) {
  const h = Math.round(f(160, 230));
  const pinS = Math.round(f(11, 14));
  const pins = compact
    ? [{ top: 25, left: 50, c: C.vert }, { top: 65, left: 110, c: C.orange }, { top: 45, left: 150, c: C.rouge }, { top: 105, left: 200, c: C.bleu }, { top: 115, left: 70, c: C.rouge }]
    : [{ top: 40, left: 70, c: C.vert }, { top: 95, left: 150, c: C.orange }, { top: 70, left: 200, c: C.rouge }, { top: 150, left: 240, c: C.bleu }, { top: 160, left: 60, c: C.rouge }, { top: 180, left: 130, c: C.vert }];
  return (
    <View>
      <View style={{ height: h, borderRadius: 7, backgroundColor: '#EFE3CD', position: 'relative', overflow: 'hidden', marginTop: compact ? 4 : 0 }}>
        <View style={{ position: 'absolute', top: compact ? 20 : 30, left: compact ? 40 : 50, width: compact ? 70 : 100, height: compact ? 70 : 100, borderRadius: compact ? 35 : 50, backgroundColor: C.rouge, opacity: 0.15 }} />
        <View style={{ position: 'absolute', top: compact ? 50 : 80, left: compact ? 130 : 170, width: compact ? 60 : 80, height: compact ? 60 : 80, borderRadius: compact ? 30 : 40, backgroundColor: C.orange, opacity: 0.12 }} />
        <View style={{ position: 'absolute', top: compact ? 30 : 45, width: '70%', left: 0, height: 3, borderRadius: 1.5, backgroundColor: '#D9C2A0', transform: [{ rotate: compact ? '-3deg' : '-2deg' }], opacity: 0.6 }} />
        <View style={{ position: 'absolute', top: compact ? 90 : 130, width: '60%', right: 0, height: 3, borderRadius: 1.5, backgroundColor: '#D9C2A0', transform: [{ rotate: compact ? '2deg' : '1deg' }], opacity: 0.6 }} />
        {pins.map((p, i) => (
          <View key={i} style={{ position: 'absolute', top: p.top, left: p.left, width: pinS, height: pinS, borderRadius: pinS / 2, backgroundColor: p.c, borderWidth: 2, borderColor: C.blanc, ...shadow }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: compact ? 'flex-start' : 'space-between', marginTop: f(8, 10) }}>
        <View style={{ flexDirection: 'row', gap: f(8, 12), flexWrap: 'wrap', alignItems: 'center' }}>
          {[{ c: C.vert, l: 'Moderne' }, { c: C.orange, l: 'Obsolète' }, { c: C.rouge, l: 'Dégradé' }, { c: C.bleu, l: 'Disponible' }].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View style={{ width: f(6, 6), height: f(6, 6), borderRadius: 3, backgroundColor: item.c }} />
              <Text style={{ fontSize: f(10, 11), color: '#9b9b9b' }}>{item.l}</Text>
            </View>
          ))}
        </View>
        {!compact && <Text style={{ fontSize: f(10, 11), color: '#9b9b9b' }}>1,284 points</Text>}
      </View>
    </View>
  );
}

// ─── Donut ───────────────────────────────────────────────────────────────────
function Donut({ pct, compact, f, t }) {
  const oS = Math.round(f(100, 140));
  const oB = Math.round(f(10, 14));
  const pctS = Math.round(f(22, 26));
  const subS = Math.round(f(8.5, 11));
  return (
    <View style={{ flexDirection: compact ? 'row' : 'column', alignItems: 'center', gap: compact ? f(14, 20) : 0 }}>
      <View style={{ width: oS, height: oS, borderRadius: oS / 2, borderWidth: oB, borderColor: C.grisClair, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <View style={{ position: 'absolute', width: oS, height: oS, borderRadius: oS / 2, borderWidth: oB, borderColor: 'transparent', borderTopColor: C.vert, borderRightColor: C.vert, transform: [{ rotate: `${-90 + (pct / 100) * 360}deg` }] }} />
        <View style={{ width: oS - oB * 2, height: oS - oB * 2, borderRadius: (oS - oB * 2) / 2, backgroundColor: C.blanc, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: pctS, fontWeight: 'bold', color: C.noir }}>{pct}%</Text>
          <Text style={{ fontSize: subS, color: '#9b9b9b', marginTop: t < 0.3 ? 0 : 2 }}>
            {compact ? 'conformité' : 'conformité moyenne'}
          </Text>
        </View>
      </View>
      {compact ? (
        <View style={{}}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.vert }} />
            <Text style={{ fontSize: f(10.5, 11), color: '#444' }}>Conforme</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.blanc, borderWidth: 1, borderColor: '#ddd' }} />
            <Text style={{ fontSize: f(10.5, 11), color: '#444' }}>À revoir</Text>
          </View>
          <Text style={{ fontSize: f(9.5, 10), color: '#9b9b9b', marginTop: 4 }}>Objectif annuel : 85%</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.vert }} />
            <Text style={{ fontSize: f(10.5, 11), color: '#6b6b6b' }}>Conforme</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.blanc, borderWidth: 1, borderColor: '#ddd' }} />
            <Text style={{ fontSize: f(10.5, 11), color: '#6b6b6b' }}>À revoir</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Signalement Item ────────────────────────────────────────────────────────
function SigItem({ titre, zone, date, statut, statutColor, type, compact, f }) {
  const thumbS = Math.round(f(38, 42));
  const iconS = Math.round(f(18, 20));
  return (
    <View style={compact ? {
      flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.blanc,
      borderRadius: 8, padding: 11, marginBottom: 9, ...shadow,
    } : {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    }}>
      <View style={{ width: thumbS, height: thumbS, borderRadius: 7, backgroundColor: C.grisClair, justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
        <IconScreen color={statutColor} sz={iconS} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: f(12, 13), fontWeight: 'bold', color: C.noir }}>{titre}</Text>
        <Text style={{ fontSize: f(10, 11), color: '#9b9b9b', marginTop: 2 }}>
          {compact ? `${zone.split(' ').slice(-1)[0] || zone} · ${date}` : `${zone} · ${date}${type ? ` · ${type}` : ''}`}
        </Text>
      </View>
      <View style={[badgS, { backgroundColor: statutColor + '1E' }]}>
        <Text style={{ fontSize: compact ? f(9, 9.5) : f(9.5, 10), fontWeight: 'bold', color: statutColor }}>{statut}</Text>
      </View>
    </View>
  );
}

// ─── CatBar ──────────────────────────────────────────────────────────────────
function CatBar({ nom, count, color, pct, compact, f }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: f(8, 10), marginBottom: compact ? f(10, 11) : f(12, 14) }}>
      <Text style={{ fontSize: f(10.5, 12), width: compact ? f(85, 100) : f(105, 118), color: '#444', flexShrink: 0 }} numberOfLines={1}>{nom}</Text>
      <View style={{ flex: 1, height: compact ? f(6.5, 7) : f(7.5, 8), backgroundColor: C.grisClair, borderRadius: 5, overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: 5, width: `${pct}%`, backgroundColor: color }} />
      </View>
      <Text style={{ fontSize: f(10.5, 12), fontWeight: 'bold', width: compact ? f(18, 20) : f(24, 28), textAlign: 'right' }}>{count}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function EtatsDesLieux() {
  const [data, setData] = useState(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const t = useT();
  const f = useFluid();
  useEffect(() => { api('/etats-lieux').then(setData).catch(() => {}); }, []);

  const k = data?.kpis;
  const signalements = data?.signalements ?? [];
  const categories = data?.categories ?? [];
  const conformite = data?.conformite?.taux ?? 78;

  const displaySignalements = signalements.length > 0 ? signalements : [
    { id: 1, titre: 'Panneau dégradé — Av. Steinmetz', zone: 'Zone Akpakpa', date: 'il y a 2h', statut: 'Urgent', statutColor: C.rouge, type: 'photo jointe' },
    { id: 2, titre: 'Panneau obsolète — Rond-point Étoile Rouge', zone: 'Zone Ganhi', date: 'il y a 5h', statut: 'En cours', statutColor: C.orange, type: 'vidéo jointe' },
    { id: 3, titre: 'Emplacement inapproprié — Marché Dantokpa', zone: 'Zone Dantokpa', date: 'il y a 1j', statut: 'Nouveau', statutColor: '#6b6b6b' },
    { id: 4, titre: 'Besoin de maintenance — Bd. de la Marina', zone: 'Zone Haie Vive', date: 'il y a 2j', statut: 'Résolu', statutColor: C.vert },
  ];
  const displayCategories = [
    { nom: 'Panneau dégradé', count: 24, color: C.rouge, pct: 82 },
    { nom: 'Panneau dangereux', count: 11, color: C.rouge, pct: 38 },
    { nom: 'Panneau obsolète', count: 17, color: C.orange, pct: 58 },
    { nom: 'Emplacement inapproprié', count: 7, color: C.bleu, pct: 24 },
    { nom: 'Besoin de maintenance', count: 4, color: C.vert, pct: 14 },
  ];
  const displayCategoriesMobile = [
    { nom: 'Dégradé', count: 24, color: C.rouge, pct: 82 },
    { nom: 'Dangereux', count: 11, color: C.rouge, pct: 38 },
    { nom: 'Obsolète', count: 17, color: C.orange, pct: 58 },
    { nom: 'Mal placé', count: 7, color: C.bleu, pct: 24 },
    { nom: 'Maintenance', count: 4, color: C.vert, pct: 14 },
  ];

  const topPd = Math.round(f(24, 28));
  const pageTtlS = Math.round(f(22, 26));
  const pageSubS = Math.round(f(12, 13));
  const logoFs = Math.round(f(16, 20));
  const bdgPv = Math.round(f(6, 7));
  const bdgPh = Math.round(f(12, 14));
  const gapS = Math.round(f(10, 16));
  const kpiGap = Math.round(f(10, 16));

  // ── Desktop Layout ──────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.grisClair }} contentContainerStyle={{ padding: topPd, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            </View>
            <Text style={{ fontSize: pageTtlS, fontWeight: 'bold', marginTop: 2, color: C.noir }}>États des Lieux</Text>
            <Text style={{ fontSize: pageSubS, color: '#6b6b6b', marginTop: 2 }}>Suivi en temps réel de la panneautique publicitaire</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.blanc, borderRadius: 999, paddingVertical: bdgPv, paddingRight: bdgPh + 4, paddingLeft: bdgPh - 2, ...shadow }}>
            <View style={{ width: f(20, 22), height: f(20, 22), borderRadius: f(10, 11), backgroundColor: C.rouge, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: C.blanc, fontSize: f(10, 11), fontWeight: 'bold' }}>CO</Text>
            </View>
            <Text style={{ fontSize: f(12, 13), fontWeight: 'bold', color: C.noir }}>Cotonou</Text>
            <SvgChevron />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <FilterBox label="Période" value="📅 30 derniers jours" f={f} />
          <FilterBox label="Type de panneau" value="Tous" f={f} />
          <FilterBox label="Statut signalement" value="Tous" f={f} />
          <FilterBox label="Zone" value="Toutes zones" f={f} />
          <TouchableOpacity style={{ marginLeft: 'auto', backgroundColor: C.rouge, borderRadius: 8, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8, ...shadow, height: f(36, 40) }}>
            <IconPlus />
            <Text style={{ color: C.blanc, fontSize: f(12, 13), fontWeight: 'bold' }}>Nouveau signalement</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: kpiGap, marginBottom: 18 }}>
          <KpiCard label="Panneaux recensés" value={k ? formatNb(k.panneauxRecenses.valeur) : '1,284'} delta={k?.panneauxRecenses.delta ?? '6.2'} direction="up" foot={k?.panneauxRecenses.details ?? 'dont 812 modernes'} iconBg="rgba(193,154,107,0.16)" f={f}>
            <IconScreen color={C.bleu} />
          </KpiCard>
          <KpiCard label="Panneaux obsolètes" value={k ? formatNb(k.panneauxObsoletes.valeur) : '472'} delta={k?.panneauxObsoletes.delta ?? '2.1'} direction="up" foot={k?.panneauxObsoletes.details ?? "36,8% du parc total"} iconBg="rgba(217,164,65,0.16)" f={f}>
            <IconWarning color={C.orange} />
          </KpiCard>
          <KpiCard label="Signalements actifs" value={k ? formatNb(k.signalementsActifs.valeur) : '63'} delta={k?.signalementsActifs.delta ?? '11'} direction="up" foot={k?.signalementsActifs.details ?? '18 en attente de validation'} iconBg="rgba(199,93,79,0.14)" f={f}>
            <IconPin color={C.rouge} />
          </KpiCard>
          <KpiCard label="Taux de conformité" value={k ? `${k.tauxConformite.valeur}%` : '78.4%'} delta={k?.tauxConformite.delta ?? '3.4'} direction="up" foot={k?.tauxConformite.details ?? 'objectif annuel : 85%'} iconBg="rgba(110,139,91,0.16)" f={f}>
            <IconCheck color={C.vert} />
          </KpiCard>
        </View>

        <View style={{ flexDirection: width < 960 ? 'column' : 'row', gap: 16, marginBottom: 16 }}>
          <View style={{ flex: width < 960 ? undefined : 2 }}>
            <Panel title="Évolution du parc publicitaire — 30 derniers jours" tag="Cotonou" f={f}>
              <Chart f={f} t={t} />
            </Panel>
          </View>
          <View style={{ flex: width < 960 ? undefined : 1 }}>
            <Panel title="Carte interactive" tag="Heatmap" f={f}>
              <MiniMap f={f} />
            </Panel>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ flex: 1, minWidth: width < 768 ? '100%' : f(300, 380) }}>
            <Panel title="Signalements récents" tag={`${displaySignalements.length} actifs`} f={f}>
              {displaySignalements.map(sig => <SigItem key={sig.id} {...sig} f={f} />)}
            </Panel>
          </View>
          <View style={{ flex: 1, minWidth: width < 768 ? '100%' : f(260, 320) }}>
            <Panel title="Signalements par catégorie" topPad={14} f={f}>
              {displayCategories.map((c, i) => <CatBar key={i} {...c} f={f} />)}
            </Panel>
          </View>
          <View style={{ flex: 1, minWidth: width < 768 ? '100%' : f(240, 300) }}>
            <Panel title="Qualité de l'aménagement" f={f}>
              <Donut pct={conformite} f={f} t={t} />
            </Panel>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── Mobile Layout ──────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#F2E7D3' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{
          backgroundColor: C.blanc, paddingHorizontal: 18, paddingTop: f(12, 14), paddingBottom: f(14, 16),
          borderBottomLeftRadius: 18, borderBottomRightRadius: 18, ...shadow, marginBottom: 14,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.grisClair, borderRadius: 999, paddingVertical: 5, paddingLeft: 6, paddingRight: 10, height: 28 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.rouge, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: C.blanc, fontSize: 8, fontWeight: 'bold' }}>CO</Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: C.noir }}>Cotonou</Text>
                <SvgChevron />
              </View>
            </View>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.grisClair, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <IconBell />
              <View style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.rouge, borderWidth: 1.5, borderColor: C.blanc }} />
            </View>
          </View>
          <Text style={{ fontSize: pageTtlS, fontWeight: 'bold', marginTop: 2, color: C.noir }}>États des Lieux</Text>
          <Text style={{ fontSize: pageSubS, color: '#6b6b6b', marginTop: 2 }}>Suivi en temps réel de la panneautique</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 18, marginBottom: 14 }} contentContainerStyle={{ paddingRight: 18 }}>
          <FilterChip label="Tous" active />
          <FilterChip label="Modernes" icon={C.vert} />
          <FilterChip label="Obsolètes" icon={C.orange} />
          <FilterChip label="Dégradés" icon={C.rouge} />
          <FilterChip label="Près de moi" icon="geo" />
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <KpiCard compact label="Panneaux recensés" value={k ? formatNb(k.panneauxRecenses.valeur) : '1,284'} delta={k?.panneauxRecenses.delta ?? '6.2'} direction="up" iconBg="rgba(193,154,107,0.16)" f={f}>
              <IconScreen color={C.bleu} sz={14} />
            </KpiCard>
            <KpiCard compact label="Obsolètes" value={k ? formatNb(k.panneauxObsoletes.valeur) : '472'} delta={k?.panneauxObsoletes.delta ?? '2.1'} direction="up" iconBg="rgba(217,164,65,0.16)" f={f}>
              <IconWarning color={C.orange} sz={14} />
            </KpiCard>
            <KpiCard compact label="Signalements" value={k ? formatNb(k.signalementsActifs.valeur) : '63'} delta={k?.signalementsActifs.delta ?? '11'} direction="up" iconBg="rgba(199,93,79,0.14)" f={f}>
              <IconPin color={C.rouge} sz={14} />
            </KpiCard>
            <KpiCard compact label="Conformité" value={k ? `${k.tauxConformite.valeur}%` : '78.4%'} delta={k?.tauxConformite.delta ?? '3.4'} direction="up" iconBg="rgba(110,139,91,0.16)" f={f}>
              <IconCheck color={C.vert} sz={14} />
            </KpiCard>
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Évolution sur 30 jours</Text>
          </View>
          <Panel f={f}><Chart compact f={f} t={t} /></Panel>
        </View>

        <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Carte interactive</Text>
            <Text style={{ fontSize: f(11, 11.5), color: C.bleu, fontWeight: 'bold' }}>Plein écran</Text>
          </View>
          <Panel f={f}><MiniMap compact f={f} /></Panel>
        </View>

        <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Signalements récents</Text>
            <Text style={{ fontSize: f(11, 11.5), color: C.bleu, fontWeight: 'bold' }}>Voir tout</Text>
          </View>
          {displaySignalements.map(sig => <SigItem key={sig.id} {...sig} compact f={f} />)}
        </View>

        <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Par catégorie</Text>
          </View>
          <Panel topPad={14} f={f}>
            {displayCategoriesMobile.map((c, i) => <CatBar key={i} {...c} compact f={f} />)}
          </Panel>
        </View>

        <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: f(13, 14), fontWeight: 'bold', color: C.noir }}>Qualité de l'aménagement</Text>
          </View>
          <Panel f={f}><Donut pct={conformite} compact f={f} t={t} /></Panel>
        </View>
      </ScrollView>

      <TouchableOpacity style={{
        position: 'absolute', right: 20, bottom: 96, width: 54, height: 54, borderRadius: 27,
        backgroundColor: C.rouge, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10,
      }}>
        <IconCamera />
      </TouchableOpacity>
    </View>
  );
}
