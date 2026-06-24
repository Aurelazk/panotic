import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, FlatList, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const API_BASE = '/api/v1';
const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 64;
const CARD_SPACING = 16;

const COLORS = {
  bleu: '#1E73BE',
  orange: '#F5A623',
  vert: '#3BB273',
  rouge: '#E94E3C',
  violet: '#8E44AD',
  grisClair: '#F5F7FA',
  gris: '#6B7280',
  grisMoyen: '#9CA3AF',
  noir: '#1F2937',
  blanc: '#FFFFFF',
};

const TYPE_COLORS = {
  relais: COLORS.orange,
  formations: COLORS.vert,
  etats: COLORS.rouge,
  posts: COLORS.bleu,
};

const TYPE_ICONS = {
  relais: '📢',
  formations: '📚',
  etats: '📋',
  posts: '💬',
};

const TYPE_LABELS = {
  relais: 'Relais Publicitaire',
  formations: 'Formations',
  etats: 'États des Lieux',
  posts: 'Posts / Réseaux',
};

const TYPE_SCREENS = {
  relais: 'Publicite',
  formations: 'Formation',
  etats: 'Signalement',
  posts: 'Social',
};

function formatNumber(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function PaginationDots({ count, activeIndex, color }) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === activeIndex ? color : '#E5E7EB',
              width: i === activeIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

function CarouselCard({ ville, isFavorite, onToggleFavorite, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.carouselCard, { borderTopColor: ville.couleur }]}
      onPress={() => onPress(ville)}
      activeOpacity={0.9}
    >
      <View style={[styles.cardColorArea, { backgroundColor: ville.couleur }]}>
        <View style={styles.cardColorOverlay} />
        <Text style={styles.cardInitial}>{ville.nom[0]}</Text>
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => onToggleFavorite(ville.id)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.favIcon, isFavorite && styles.favIconActive]}>
            {isFavorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{ville.nom}</Text>
        <Text style={styles.cardRegion}>{ville.region}, {ville.pays}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{ville.description}</Text>

        <View style={styles.cardStatsRow}>
          <View style={styles.cardStat}>
            <Text style={styles.cardStatValue}>{ville.stats.panneaux.total}</Text>
            <Text style={styles.cardStatLabel}>Panneaux</Text>
          </View>
          <View style={styles.cardStatDivider} />
          <View style={styles.cardStat}>
            <Text style={[styles.cardStatValue, { color: COLORS.rouge }]}>{ville.stats.signalements.total}</Text>
            <Text style={styles.cardStatLabel}>Signalements</Text>
          </View>
          <View style={styles.cardStatDivider} />
          <View style={styles.cardStat}>
            <Text style={[styles.cardStatValue, { color: COLORS.vert }]}>{ville.stats.formations.total}</Text>
            <Text style={styles.cardStatLabel}>Formations</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RubriqueCard({ rubrique, onPress }) {
  const icon = TYPE_ICONS[rubrique.id] || '📌';
  const label = rubrique.label || TYPE_LABELS[rubrique.id] || rubrique.id;
  const color = rubrique.color || TYPE_COLORS[rubrique.id] || COLORS.bleu;

  return (
    <TouchableOpacity
      style={[styles.rubriqueCard, { borderLeftColor: color }]}
      onPress={() => onPress(rubrique)}
      activeOpacity={0.7}
    >
      <View style={styles.rubriqueRow}>
        <View style={[styles.rubriqueIconWrap, { backgroundColor: color + '15' }]}>
          <Text style={styles.rubriqueIcon}>{icon}</Text>
        </View>
        <View style={styles.rubriqueInfo}>
          <Text style={styles.rubriqueTitle}>{label}</Text>
          <Text style={styles.rubriqueDesc} numberOfLines={1}>{rubrique.description}</Text>
        </View>
        <View style={[styles.rubriqueBadge, { backgroundColor: color }]}>
          <Text style={styles.rubriqueBadgeText}>{rubrique.count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function VilleDetail({ ville, onBack, onRubriquePress }) {
  const panneauxPct = ville.stats.panneaux.total > 0
    ? Math.round((ville.stats.panneaux.disponibles / ville.stats.panneaux.total) * 100)
    : 0;
  const signalementsPct = ville.stats.signalements.total > 0
    ? Math.round((ville.stats.signalements.resolus / ville.stats.signalements.total) * 100)
    : 0;

  return (
    <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
      <View style={[styles.detailHeader, { backgroundColor: ville.couleur }]}>
        <TouchableOpacity style={styles.detailBackBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.detailBackArrow}>←</Text>
          <Text style={styles.detailBackText}>Villes</Text>
        </TouchableOpacity>
        <View style={styles.detailHeaderContent}>
          <View style={styles.detailAvatar}>
            <Text style={styles.detailAvatarText}>{ville.nom[0]}</Text>
          </View>
          <Text style={styles.detailTitle}>{ville.nom}</Text>
          <Text style={styles.detailSubtitle}>{ville.region}, {ville.pays}</Text>
          <Text style={styles.detailDesc}>{ville.description}</Text>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatValue}>{formatNumber(ville.population)}</Text>
          <Text style={styles.quickStatLabel}>Population</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatValue, { color: COLORS.rouge }]}>{ville.stats.signalements.total}</Text>
          <Text style={styles.quickStatLabel}>Signalements</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatValue, { color: COLORS.vert }]}>{ville.stats.panneaux.disponibles}</Text>
          <Text style={styles.quickStatLabel}>Disponibles</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStat}>
          <Text style={[styles.quickStatValue, { color: COLORS.orange }]}>{formatNumber(ville.stats.utilisateurs)}</Text>
          <Text style={styles.quickStatLabel}>Membres</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>État des lieux</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Panneaux disponibles</Text>
              <Text style={styles.progressValue}>{panneauxPct}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: panneauxPct + '%', backgroundColor: COLORS.vert }]} />
            </View>
            <Text style={styles.progressDetail}>
              {ville.stats.panneaux.disponibles} dispo / {ville.stats.panneaux.total} total
            </Text>
          </View>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Signalements résolus</Text>
              <Text style={styles.progressValue}>{signalementsPct}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: signalementsPct + '%', backgroundColor: COLORS.orange }]} />
            </View>
            <Text style={styles.progressDetail}>
              {ville.stats.signalements.resolus} résolus / {ville.stats.signalements.total} total
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rubriques</Text>
        {ville.rubriques.map(r => (
          <RubriqueCard key={r.id} rubrique={r} onPress={onRubriquePress} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Panneaux par statut</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusChip, { backgroundColor: COLORS.vert + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.vert }]} />
            <Text style={styles.statusText}>{ville.stats.panneaux.disponibles} Disponibles</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: COLORS.orange + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.orange }]} />
            <Text style={styles.statusText}>{ville.stats.panneaux.loues} Loués</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: COLORS.rouge + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.rouge }]} />
            <Text style={styles.statusText}>{ville.stats.panneaux.maintenance} Maintenance</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function Villes() {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [villes, setVilles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVille, setSelectedVille] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchVilles = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API_BASE}/villes${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVilles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Erreur chargement villes:', e.message);
      setVilles([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchVilles();
  }, [fetchVilles]);

  const toggleFavorite = useCallback((villeId) => {
    setFavorites(prev =>
      prev.includes(villeId) ? prev.filter(id => id !== villeId) : [...prev, villeId]
    );
  }, []);

  const navigateToScreen = useCallback((screenName) => {
    try {
      navigation.navigate(screenName);
    } catch (e) {
      console.warn('Navigation error:', e.message);
    }
  }, [navigation]);

  const handleRubriquePress = useCallback((rubrique) => {
    const screen = TYPE_SCREENS[rubrique.id];
    if (screen) {
      navigateToScreen(screen);
    }
  }, [navigateToScreen]);

  const handleCityPress = useCallback((ville) => {
    setSelectedVille(ville);
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (selectedVille) {
    return (
      <View style={styles.container}>
        <VilleDetail
          ville={selectedVille}
          onBack={() => setSelectedVille(null)}
          onRubriquePress={handleRubriquePress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AANID</Text>
          <Text style={styles.headerSubtitle}>Panneautique urbaine</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{villes.length} villes</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une ville..."
          placeholderTextColor={COLORS.grisMoyen}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.bleu} />
          <Text style={styles.loadingText}>Chargement des villes...</Text>
        </View>
      ) : villes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🏙️</Text>
          <Text style={styles.emptyText}>Aucune ville trouvée</Text>
          {search ? (
            <Text style={styles.emptySubtext}>Essayez un autre terme de recherche</Text>
          ) : (
            <Text style={styles.emptySubtext}>Vérifiez que le backend est lancé</Text>
          )}
        </View>
      ) : (
        <View style={styles.carouselSection}>
          <View style={styles.carouselHeader}>
            <Text style={styles.carouselTitle}>
              {search ? `Résultats: "${search}"` : 'Explorez les villes'}
            </Text>
            <Text style={styles.carouselSubtitle}>
              {villes.length} ville{villes.length > 1 ? 's' : ''} · Afrique de l'Ouest
            </Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={villes}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item }) => (
              <CarouselCard
                ville={item}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={toggleFavorite}
                onPress={handleCityPress}
              />
            )}
          />

          <PaginationDots
            count={villes.length}
            activeIndex={activeIndex}
            color={COLORS.bleu}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  // ─── Header ──────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.bleu,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.blanc,
  },
  headerSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerBadgeText: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blanc,
  },

  // ─── Search ───────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blanc,
    marginHorizontal: 20,
    marginTop: -14,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    color: COLORS.noir,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.grisMoyen,
    paddingLeft: 10,
    fontWeight: '600',
  },

  // ─── Loading & Empty ──────────────────────────────────────────
  loadingText: {
    fontFamily: 'CenturyGothic',
    marginTop: 14,
    fontSize: 14,
    color: COLORS.gris,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.noir,
  },
  emptySubtext: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: COLORS.gris,
    marginTop: 8,
    textAlign: 'center',
  },

  // ─── Carousel ─────────────────────────────────────────────────
  carouselSection: {
    flex: 1,
  },
  carouselHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  carouselTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.noir,
  },
  carouselSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: COLORS.gris,
    marginTop: 4,
  },
  carouselContent: {
    paddingHorizontal: 32,
    paddingBottom: 8,
  },
  carouselCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.blanc,
    borderRadius: 16,
    marginRight: CARD_SPACING,
    borderTopWidth: 3,
    borderTopColor: COLORS.bleu,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  cardColorArea: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardColorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardInitial: {
    fontFamily: 'CenturyGothic',
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.blanc,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  favIcon: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.7)',
  },
  favIconActive: {
    color: '#FFD700',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.noir,
  },
  cardRegion: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: COLORS.gris,
    marginTop: 2,
  },
  cardDesc: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: COLORS.grisMoyen,
    marginTop: 8,
    lineHeight: 18,
  },
  cardStatsRow: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  cardStat: {
    flex: 1,
    alignItems: 'center',
  },
  cardStatValue: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.noir,
  },
  cardStatLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 10,
    color: COLORS.grisMoyen,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },

  // ─── Pagination ───────────────────────────────────────────────
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // ─── Detail View ──────────────────────────────────────────────
  detailContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  detailHeader: {
    paddingBottom: 28,
  },
  detailBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  detailBackArrow: {
    fontSize: 22,
    color: COLORS.blanc,
    marginRight: 8,
    fontWeight: '600',
  },
  detailBackText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  detailHeaderContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailAvatarText: {
    fontFamily: 'CenturyGothic',
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.blanc,
  },
  detailTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.blanc,
    textAlign: 'center',
  },
  detailSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  detailDesc: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
    lineHeight: 20,
    textAlign: 'center',
  },

  // ─── Quick Stats ──────────────────────────────────────────────
  quickStatsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -20,
    backgroundColor: COLORS.blanc,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.noir,
  },
  quickStatLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 10,
    color: COLORS.gris,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },

  // ─── Sections ─────────────────────────────────────────────────
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.noir,
    marginBottom: 14,
  },

  // ─── Progress ─────────────────────────────────────────────────
  progressRow: {
    gap: 14,
  },
  progressItem: {
    backgroundColor: COLORS.blanc,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gris,
  },
  progressValue: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.noir,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetail: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: COLORS.grisMoyen,
    marginTop: 6,
  },

  // ─── Status Chips ─────────────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.noir,
  },

  // ─── Rubriques ────────────────────────────────────────────────
  rubriqueCard: {
    backgroundColor: COLORS.blanc,
    marginBottom: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  rubriqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rubriqueIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rubriqueIcon: {
    fontSize: 20,
  },
  rubriqueInfo: {
    flex: 1,
  },
  rubriqueTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.noir,
  },
  rubriqueDesc: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: COLORS.gris,
    marginTop: 2,
  },
  rubriqueBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  rubriqueBadgeText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.blanc,
  },
});
