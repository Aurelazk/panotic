import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const API_BASE = 'http://localhost:4000/api/v1';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const COLORS = {
  bleu: '#1E73BE',
  orange: '#F5A623',
  vert: '#3BB273',
  rouge: '#E94E3C',
  grisClair: '#F5F5F5',
  grisMoyen: '#BDBDBD',
  noir: '#212121',
  blanc: '#FFFFFF',
};

const RUBRIQUE_META = {
  relais: { label: 'Relais Publicitaire', icon: '📢', color: COLORS.orange, screen: 'Publicite' },
  formations: { label: 'Formations', icon: '📚', color: COLORS.vert, screen: 'Formation' },
  etats: { label: 'États des Lieux', icon: '📋', color: COLORS.rouge, screen: 'Signalement' },
  posts: { label: 'Posts / Réseaux', icon: '💬', color: COLORS.bleu, screen: 'Social' },
};

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function VilleCard({ ville, onPress, isFavorite, onToggleFavorite }) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderTopColor: ville.couleur }]}
      onPress={() => onPress(ville)}
      activeOpacity={0.8}
    >
      <TouchableOpacity
        style={styles.favBtn}
        onPress={() => onToggleFavorite(ville.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.favIcon}>{isFavorite ? '★' : '☆'}</Text>
      </TouchableOpacity>

      <View style={[styles.cardColorBar, { backgroundColor: ville.couleur }]}>
        <Text style={styles.cardInitial}>{ville.nom[0]}</Text>
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>{ville.nom}</Text>
      <Text style={styles.cardRegion} numberOfLines={1}>{ville.pays}</Text>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(ville.stats.panneaux.total)}</Text>
          <Text style={styles.statLabel}>Panneaux</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(ville.stats.signalements.total)}</Text>
          <Text style={styles.statLabel}>Signalements</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(ville.stats.formations.total)}</Text>
          <Text style={styles.statLabel}>Formations</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RubriqueCard({ rubrique, onPress }) {
  const meta = RUBRIQUE_META[rubrique.id] || {};
  return (
    <TouchableOpacity
      style={[styles.rubriqueCard, { borderLeftColor: rubrique.color }]}
      onPress={() => onPress(rubrique)}
      activeOpacity={0.7}
    >
      <View style={styles.rubriqueHeader}>
        <Text style={styles.rubriqueIcon}>{meta.icon || '📌'}</Text>
        <View style={styles.rubriqueInfo}>
          <Text style={styles.rubriqueTitle}>{rubrique.label}</Text>
          <Text style={styles.rubriqueDesc} numberOfLines={1}>{rubrique.description}</Text>
        </View>
        <View style={[styles.rubriqueBadge, { backgroundColor: rubrique.color }]}>
          <Text style={styles.rubriqueBadgeText}>{rubrique.count}</Text>
        </View>
      </View>
      <View style={[styles.rubriqueBar, { backgroundColor: rubrique.color }]} />
    </TouchableOpacity>
  );
}

function VilleHub({ ville, onBack, onRubriquePress }) {
  return (
    <ScrollView style={styles.hubContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.backText}>Toutes les villes</Text>
      </TouchableOpacity>

      <View style={styles.hubHeader}>
        <View style={[styles.hubAvatar, { backgroundColor: ville.couleur }]}>
          <Text style={styles.hubAvatarText}>{ville.nom[0]}</Text>
        </View>
        <View style={styles.hubHeaderInfo}>
          <Text style={styles.hubTitle}>{ville.nom}</Text>
          <Text style={styles.hubSubtitle}>{ville.region}, {ville.pays}</Text>
          <Text style={styles.hubDesc} numberOfLines={2}>{ville.description}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{formatNumber(ville.population)}</Text>
          <Text style={styles.statCardLabel}>Population</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statCardValue, { color: COLORS.rouge }]}>{ville.stats.signalements.total}</Text>
          <Text style={styles.statCardLabel}>Signalements</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statCardValue, { color: COLORS.vert }]}>{ville.stats.panneaux.disponibles}</Text>
          <Text style={styles.statCardLabel}>Disponibles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statCardValue, { color: COLORS.orange }]}>{ville.stats.utilisateurs}</Text>
          <Text style={styles.statCardLabel}>Membres</Text>
        </View>
      </View>

      <View style={styles.statsDetail}>
        <View style={styles.statsDetailRow}>
          <View style={styles.statsDetailItem}>
            <Text style={styles.statsDetailLabel}>Panneaux</Text>
            <View style={styles.statsDetailBar}>
              <View style={[styles.statsDetailFill, { width: `${(ville.stats.panneaux.disponibles / ville.stats.panneaux.total) * 100}%`, backgroundColor: COLORS.vert }]} />
            </View>
            <Text style={styles.statsDetailText}>{ville.stats.panneaux.disponibles} dispo / {ville.stats.panneaux.total}</Text>
          </View>
          <View style={styles.statsDetailItem}>
            <Text style={styles.statsDetailLabel}>Signalements</Text>
            <View style={styles.statsDetailBar}>
              <View style={[styles.statsDetailFill, { width: `${(ville.stats.signalements.resolus / ville.stats.signalements.total) * 100}%`, backgroundColor: COLORS.vert }]} />
            </View>
            <Text style={styles.statsDetailText}>{ville.stats.signalements.resolus} résolus / {ville.stats.signalements.total}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Rubriques</Text>
      {ville.rubriques.map(r => (
        <RubriqueCard key={r.id} rubrique={r} onPress={onRubriquePress} />
      ))}
    </ScrollView>
  );
}

export default function Villes() {
  const navigation = useNavigation();
  const [villes, setVilles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVille, setSelectedVille] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const fetchVilles = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${API_BASE}/villes${params}`);
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

  const handleRubriquePress = useCallback((rubrique) => {
    const meta = RUBRIQUE_META[rubrique.id];
    if (meta?.screen) {
      navigation.navigate(meta.screen);
    }
  }, [navigation]);

  if (selectedVille) {
    return (
      <View style={styles.container}>
        <VilleHub
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
        <Text style={styles.headerTitle}>AANID</Text>
        <Text style={styles.headerSubtitle}>Gestion de la panneautique urbaine</Text>
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
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.bleu} />
          <Text style={styles.loadingText}>Chargement des villes...</Text>
        </View>
      ) : villes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏙️</Text>
          <Text style={styles.emptyText}>Aucune ville trouvée</Text>
          {search ? <Text style={styles.emptySubtext}>Essayez un autre terme de recherche</Text> : null}
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.listTitle}>
            {search ? `Résultats pour "${search}"` : 'Villes disponibles'}
          </Text>
          <Text style={styles.listSubtitle}>{villes.length} ville{villes.length > 1 ? 's' : ''} · Afrique de l'Ouest</Text>
          <View style={styles.grid}>
            {villes.map(ville => (
              <VilleCard
                key={ville.id}
                ville={ville}
                onPress={setSelectedVille}
                isFavorite={favorites.includes(ville.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: COLORS.bleu,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.blanc,
  },
  headerSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blanc,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'CenturyGothic',
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
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
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  listTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.noir,
  },
  listSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.blanc,
    borderRadius: 12,
    marginBottom: 16,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  favIcon: {
    fontSize: 18,
    color: COLORS.orange,
  },
  cardColorBar: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInitial: {
    fontFamily: 'CenturyGothic',
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.blanc,
  },
  cardTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.noir,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  cardRegion: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#6B7280',
    paddingHorizontal: 12,
    marginTop: 2,
  },
  cardStats: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.noir,
  },
  statLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },

  hubContainer: {
    flex: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: COLORS.bleu,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.blanc,
    marginRight: 8,
  },
  backText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    color: COLORS.blanc,
  },
  hubHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.bleu,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  hubAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hubAvatarText: {
    fontFamily: 'CenturyGothic',
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.blanc,
  },
  hubHeaderInfo: {
    flex: 1,
  },
  hubTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.blanc,
  },
  hubSubtitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  hubDesc: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.blanc,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardValue: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.noir,
  },
  statCardLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statsDetail: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statsDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsDetailItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsDetailLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  statsDetailBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statsDetailFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsDetailText: {
    fontFamily: 'CenturyGothic',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.noir,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  rubriqueCard: {
    backgroundColor: COLORS.blanc,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  rubriqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rubriqueIcon: {
    fontSize: 24,
    marginRight: 12,
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
    color: '#6B7280',
    marginTop: 2,
  },
  rubriqueBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rubriqueBadgeText: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.blanc,
  },
  rubriqueBar: {
    height: 3,
  },
});
