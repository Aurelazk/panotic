import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { selectCurrentVille, setVille } from '../../../../frontend/src/store/slices/authSlice';
import { getVilleById, getVilles } from '../services/villeService';

const VILLE_ID_KEY = '@aanid/v1/ville_id';
const VILLE_NOM_KEY = '@aanid/v1/ville_nom';

const FLAGS = {
  'Bénin': '🇧🇯',
  "Côte d'Ivoire": '🇨🇮',
  'Sénégal': '🇸🇳',
  'Togo': '🇹🇬',
  'Burkina Faso': '🇧🇫',
  'Ghana': '🇬🇭',
  'Nigeria': '🇳🇬',
  'Mali': '🇲🇱',
  'Niger': '🇳🇪',
};

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

function VilleDetail({ ville, isFavorite, onToggleFavorite, onRubriquePress, showWelcome }) {
  const panneauxPct = ville.stats.panneaux.total > 0
    ? Math.round((ville.stats.panneaux.disponibles / ville.stats.panneaux.total) * 100)
    : 0;
  const signalementsPct = ville.stats.signalements.total > 0
    ? Math.round((ville.stats.signalements.resolus / ville.stats.signalements.total) * 100)
    : 0;
  const flag = FLAGS[ville.pays] || '🌍';

  return (
    <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
      {showWelcome && (
        <View style={[styles.welcomeBanner, { backgroundColor: ville.couleur }]}>
          <Text style={styles.welcomeBannerText}>
            {flag} Bienvenue à {ville.nom} !
          </Text>
        </View>
      )}

      <View style={[styles.detailHeader, { backgroundColor: ville.couleur }]}>
        <View style={styles.detailHeaderContent}>
          <View style={styles.detailAvatarWrap}>
            <View style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>{ville.nom[0]}</Text>
            </View>
            <TouchableOpacity
              style={styles.detailFavBtn}
              onPress={() => onToggleFavorite(ville.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.detailFavIcon, isFavorite && styles.detailFavIconActive]}>
                {isFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.detailTitle}>{ville.nom}</Text>
          <Text style={styles.detailSubtitle}>{flag} {ville.pays} · {ville.region}</Text>
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
  const dispatch = useDispatch();
  const { villeId, villeNom } = useSelector(selectCurrentVille);

  const [ville, setVilleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [villes, setVilles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingVilles, setLoadingVilles] = useState(false);
  const [pendingVille, setPendingVille] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchVille = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await getVilleById(id);
      setVilleData(data);
      if (isFirstLoad) {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000);
        setIsFirstLoad(false);
      }
    } catch {
      setVilleData(null);
    } finally {
      setLoading(false);
    }
  }, [isFirstLoad]);

  useEffect(() => {
    (async () => {
      if (villeId) {
        fetchVille(villeId);
      } else {
        try {
          const savedId = await AsyncStorage.getItem(VILLE_ID_KEY);
          const savedNom = await AsyncStorage.getItem(VILLE_NOM_KEY);
          if (savedId && savedNom) {
            dispatch(setVille({ villeId: savedId, villeNom: savedNom }));
            return;
          }
        } catch {}
        setLoading(false);
      }
    })();
  }, [villeId, fetchVille, dispatch]);

  const navigateToScreen = useCallback((screenName) => {
    try {
      navigation.navigate(screenName);
    } catch {
      console.warn('Navigation error:', screenName);
    }
  }, [navigation]);

  const handleRubriquePress = useCallback((rubrique) => {
    const screen = TYPE_SCREENS[rubrique.id];
    if (screen) navigateToScreen(screen);
  }, [navigateToScreen]);

  const toggleFavorite = useCallback((villeId) => {
    setFavorites(prev =>
      prev.includes(villeId) ? prev.filter(id => id !== villeId) : [...prev, villeId]
    );
  }, []);

  const openSwitcher = useCallback(async () => {
    setShowSwitcher(true);
    setLoadingVilles(true);
    try {
      const data = await getVilles();
      setVilles(data);
    } catch {
      setVilles([]);
    } finally {
      setLoadingVilles(false);
    }
  }, []);

  const handleCityTap = useCallback((id, nom) => {
    if (id === villeId) return;
    setPendingVille({ id, nom });
  }, [villeId]);

  const confirmCitySwitch = useCallback(async () => {
    if (!pendingVille) return;
    const { id, nom } = pendingVille;
    dispatch(setVille({ villeId: id, villeNom: nom }));
    try {
      await AsyncStorage.setItem(VILLE_ID_KEY, id);
      await AsyncStorage.setItem(VILLE_NOM_KEY, nom);
    } catch {}
    setPendingVille(null);
    setShowSwitcher(false);
    setSearchQuery('');
    setIsFirstLoad(true);
  }, [pendingVille, dispatch]);

  // Grouper les villes par pays (sections)
  const sections = useMemo(() => {
    const map = {};
    villes.forEach(v => {
      if (!map[v.pays]) map[v.pays] = [];
      map[v.pays].push(v);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([pays, data]) => ({
        title: pays,
        flag: FLAGS[pays] || '🌍',
        data: data.filter(v =>
          v.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.pays.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter(s => s.data.length > 0);
  }, [villes, searchQuery]);

  // État : aucune ville sélectionnée
  if (!villeId) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: COLORS.bleu }]}>
          <View>
            <Text style={styles.headerTitle}>AANID</Text>
            <Text style={styles.headerSubtitle}>Panneautique urbaine</Text>
          </View>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🏙️</Text>
          <Text style={styles.emptyText}>Bienvenue sur AANID</Text>
          <Text style={styles.emptySubtext}>
            Sélectionnez une ville pour découvrir{'\n'}ses informations et fonctionnalités.
          </Text>
          <TouchableOpacity style={styles.selectCityBtn} onPress={openSwitcher}>
            <Text style={styles.selectCityBtnText}>Choisir une ville</Text>
          </TouchableOpacity>
        </View>

        <CitySwitcherModal
          visible={showSwitcher}
          sections={sections}
          loading={loadingVilles}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCityTap={handleCityTap}
          pendingVille={pendingVille}
          onConfirm={confirmCitySwitch}
          onCancel={() => setPendingVille(null)}
          onClose={() => { setShowSwitcher(false); setSearchQuery(''); setPendingVille(null); }}
          currentVilleId={villeId}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: ville?.couleur || COLORS.bleu }]}>
        <TouchableOpacity style={styles.citySwitcherBtn} onPress={openSwitcher} activeOpacity={0.7}>
          <View style={styles.citySwitcherLeft}>
            <Text style={styles.citySwitcherLabel}>Ville actuelle</Text>
            <View style={styles.citySwitcherRow}>
              <Text style={styles.citySwitcherName}>{villeNom || 'Choisir'}</Text>
              <Text style={styles.citySwitcherArrow}>▼</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{ville?.stats?.panneaux?.total || 0} panneaux</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={ville?.couleur || COLORS.bleu} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : ville ? (
        <VilleDetail
          ville={ville}
          isFavorite={favorites.includes(ville.id)}
          onToggleFavorite={toggleFavorite}
          onRubriquePress={handleRubriquePress}
          showWelcome={showWelcome}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>Ville introuvable</Text>
          <TouchableOpacity style={styles.selectCityBtn} onPress={openSwitcher}>
            <Text style={styles.selectCityBtnText}>Changer de ville</Text>
          </TouchableOpacity>
        </View>
      )}

      <CitySwitcherModal
        visible={showSwitcher}
        sections={sections}
        loading={loadingVilles}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCityTap={handleCityTap}
        pendingVille={pendingVille}
        onConfirm={confirmCitySwitch}
        onCancel={() => setPendingVille(null)}
        onClose={() => { setShowSwitcher(false); setSearchQuery(''); setPendingVille(null); }}
        currentVilleId={villeId}
      />
    </View>
  );
}

function CitySwitcherModal({ visible, sections, loading, searchQuery, onSearchChange, onCityTap, pendingVille, onConfirm, onCancel, onClose, currentVilleId }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Changer de ville</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearch}>
            <Text style={styles.modalSearchIcon}>🔍</Text>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Rechercher une ville..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#1E73BE" style={{ marginTop: 40 }} />
          ) : sections.length === 0 ? (
            <Text style={styles.modalEmpty}>Aucune ville trouvée</Text>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalList}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderFlag}>{section.flag}</Text>
                  <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
                  <Text style={styles.sectionHeaderCount}>{section.data.length}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                const isSelected = currentVilleId === item.id;
                const isPending = pendingVille?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      isSelected && styles.cityItemActive,
                      isPending && styles.cityItemPending,
                    ]}
                    onPress={() => onCityTap(item.id, item.nom)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.cityDot, { backgroundColor: item.couleur || '#1E73BE' }]} />
                    <View style={styles.cityItemInfo}>
                      <Text style={styles.cityItemName}>{item.nom}</Text>
                      <Text style={styles.cityItemCountry}>{item.region}</Text>
                    </View>
                    {isSelected && <Text style={styles.cityCheck}>✓</Text>}
                    {isPending && <Text style={styles.cityCheck}>▸</Text>}
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={
                pendingVille ? (
                  <View style={styles.confirmBar}>
                    <Text style={styles.confirmText}>
                      Basculer vers {pendingVille.nom} ?
                    </Text>
                    <View style={styles.confirmActions}>
                      <TouchableOpacity style={styles.confirmCancelBtn} onPress={onCancel}>
                        <Text style={styles.confirmCancelText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
                        <Text style={styles.confirmBtnText}>Confirmer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },

  // ─── Welcome Banner ────────────────────────────────────────────
  welcomeBanner: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  welcomeBannerText: {
    fontFamily: 'CenturyGothic',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // ─── Header ──────────────────────────────────────────────────
  header: {
    paddingTop: 16,
    paddingBottom: 20,
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

  // ─── City Switcher dans le header ───────────────────────────
  citySwitcherBtn: { flex: 1, marginRight: 12 },
  citySwitcherLeft: {},
  citySwitcherLabel: {
    fontFamily: 'CenturyGothic',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  citySwitcherRow: { flexDirection: 'row', alignItems: 'center' },
  citySwitcherName: {
    fontFamily: 'CenturyGothic',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.blanc,
    marginRight: 8,
  },
  citySwitcherArrow: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // ─── Select City Btn ──────────────────────────────────────────
  selectCityBtn: {
    backgroundColor: COLORS.bleu,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  selectCityBtnText: {
    fontFamily: 'CenturyGothic',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.blanc,
  },

  // ─── Loading & Empty ──────────────────────────────────────────
  loadingText: {
    fontFamily: 'CenturyGothic',
    marginTop: 14,
    fontSize: 14,
    color: COLORS.gris,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
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
    lineHeight: 20,
  },

  // ─── Modale de sélection de ville ────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontFamily: 'CenturyGothic', fontSize: 18, fontWeight: '700', color: '#1F2937' },
  modalClose: { fontSize: 20, color: '#9CA3AF', padding: 4 },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
  },
  modalSearchIcon: { fontSize: 14, marginRight: 8 },
  modalSearchInput: { flex: 1, fontSize: 14, color: '#1F2937', padding: 0 },
  modalList: { paddingHorizontal: 16, paddingBottom: 16 },
  modalEmpty: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 30,
    fontFamily: 'CenturyGothic',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeaderFlag: { fontSize: 16, marginRight: 8 },
  sectionHeaderTitle: {
    fontFamily: 'CenturyGothic',
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  sectionHeaderCount: {
    fontFamily: 'CenturyGothic',
    fontSize: 12,
    color: '#9CA3AF',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  cityItemActive: { backgroundColor: '#EBF5FF' },
  cityItemPending: { backgroundColor: '#FEF3C7' },
  cityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  cityItemInfo: { flex: 1 },
  cityItemName: { fontFamily: 'CenturyGothic', fontSize: 15, fontWeight: '600', color: '#1F2937' },
  cityItemCountry: { fontFamily: 'CenturyGothic', fontSize: 12, color: '#6B7280', marginTop: 2 },
  cityCheck: { fontSize: 16, color: '#1E73BE', fontWeight: '700' },
  confirmBar: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmText: {
    fontFamily: 'CenturyGothic',
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
    marginRight: 12,
  },
  confirmActions: { flexDirection: 'row', gap: 8 },
  confirmCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmCancelText: { fontFamily: 'CenturyGothic', fontSize: 12, color: '#6B7280', fontWeight: '600' },
  confirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E73BE',
  },
  confirmBtnText: { fontFamily: 'CenturyGothic', fontSize: 12, color: '#fff', fontWeight: '700' },

  // ─── Detail View ──────────────────────────────────────────────
  detailContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  detailHeader: { paddingBottom: 28 },
  detailHeaderContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  detailAvatarWrap: { position: 'relative', marginBottom: 12 },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarText: { fontFamily: 'CenturyGothic', fontSize: 32, fontWeight: 'bold', color: COLORS.blanc },
  detailFavBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailFavIcon: { fontSize: 16, color: '#9CA3AF' },
  detailFavIconActive: { color: '#F5A623' },
  detailTitle: { fontFamily: 'CenturyGothic', fontSize: 26, fontWeight: 'bold', color: COLORS.blanc, textAlign: 'center' },
  detailSubtitle: { fontFamily: 'CenturyGothic', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  detailDesc: { fontFamily: 'CenturyGothic', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 10, lineHeight: 20, textAlign: 'center' },

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
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontFamily: 'CenturyGothic', fontSize: 18, fontWeight: 'bold', color: COLORS.noir },
  quickStatLabel: { fontFamily: 'CenturyGothic', fontSize: 10, color: COLORS.gris, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  quickStatDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 6 },

  // ─── Sections ─────────────────────────────────────────────────
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontFamily: 'CenturyGothic', fontSize: 18, fontWeight: 'bold', color: COLORS.noir, marginBottom: 14 },

  // ─── Progress ─────────────────────────────────────────────────
  progressRow: { gap: 14 },
  progressItem: { backgroundColor: COLORS.blanc, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontFamily: 'CenturyGothic', fontSize: 13, fontWeight: '600', color: COLORS.gris },
  progressValue: { fontFamily: 'CenturyGothic', fontSize: 14, fontWeight: '700', color: COLORS.noir },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressDetail: { fontFamily: 'CenturyGothic', fontSize: 11, color: COLORS.grisMoyen, marginTop: 6 },

  // ─── Status Chips ─────────────────────────────────────────────
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontFamily: 'CenturyGothic', fontSize: 12, fontWeight: '600', color: COLORS.noir },

  // ─── Rubriques ────────────────────────────────────────────────
  rubriqueCard: { backgroundColor: COLORS.blanc, marginBottom: 10, borderRadius: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  rubriqueRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rubriqueIconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  rubriqueIcon: { fontSize: 20 },
  rubriqueInfo: { flex: 1 },
  rubriqueTitle: { fontFamily: 'CenturyGothic', fontSize: 15, fontWeight: '700', color: COLORS.noir },
  rubriqueDesc: { fontFamily: 'CenturyGothic', fontSize: 12, color: COLORS.gris, marginTop: 2 },
  rubriqueBadge: { minWidth: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  rubriqueBadgeText: { fontFamily: 'CenturyGothic', fontSize: 13, fontWeight: 'bold', color: COLORS.blanc },
});
