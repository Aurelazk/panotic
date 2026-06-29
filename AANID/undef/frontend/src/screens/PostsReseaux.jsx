import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, ScrollView, Alert, Dimensions, Image, Animated, RefreshControl,
} from 'react-native';

const { width } = Dimensions.get('window');

const THEMES = ['Tous', 'Environnement', 'Santé', 'Famille', 'Urbanisme'];
const VILLES = ['Toutes', 'Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Lokossa', 'Ouidah'];
const ACCENTS = ['#2E86C1', '#E74C3C', '#2ECC71', '#F5A623', '#9B59B6', '#1ABC9C'];

const GALLERY_IMAGES = [
  { id: 'g1', uri: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80' },
  { id: 'g2', uri: 'https://images.unsplash.com/photo-1532375810709-75b2da00537c?w=400&q=80' },
  { id: 'g3', uri: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80' },
  { id: 'g4', uri: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80' },
  { id: 'g5', uri: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80' },
  { id: 'g6', uri: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80' },
  { id: 'g7', uri: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=400&q=80' },
  { id: 'g8', uri: 'https://images.unsplash.com/photo-1579003593419-98f949b3b859?w=400&q=80' },
  { id: 'g9', uri: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80' },
  { id: 'g10', uri: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&q=80' },
  { id: 'g11', uri: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=400&q=80' },
  { id: 'g12', uri: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&q=80' },
];

const MOCK_POSTS = [
  {
    id: '1', author: '@KoffiD', time: '1h', location: 'Cotonou',
    text: 'Inauguration du nouveau marché central de Dantokpa après rénovation. 1200 commerçants déjà installés. Un pas de plus pour la modernisation de Cotonou 🇧🇯',
    likes: 89, comments: 24, shares: 34, theme: 'Urbanisme', ville: 'Cotonou',
    images: ['https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80'],
  },
  {
    id: '2', author: '@MariamB', time: '3h', location: 'Porto-Novo',
    text: 'Sensibilisation au palais royal : atelier sur la gestion des déchets plastiques dans le plateau. Ensemble, préservons notre patrimoine ! 🌍',
    likes: 56, comments: 14, shares: 22, theme: 'Environnement', ville: 'Porto-Novo',
    images: ['https://images.unsplash.com/photo-1532375810709-75b2da00537c?w=400&q=80'],
  },
  {
    id: '3', author: '@ArmelZ', time: '5h', location: 'Abomey-Calavi',
    text: 'La nouvelle piste cyclable reliant Calavi à Cotonou est enfin ouverte. 12km de mobilité douce pour désengorger le trafic. À tester ce week-end ! 🚲',
    likes: 134, comments: 42, shares: 67, theme: 'Urbanisme', ville: 'Abomey-Calavi',
    images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=80'],
  },
  {
    id: '4', author: '@SikaA', time: '8h', location: 'Parakou',
    text: 'Campagne de vaccination gratuite pour les enfants de 0-5 ans à l\'hôpital de Parakou. Merci aux équipes mobiles qui parcourent les villages 🏥',
    likes: 72, comments: 19, shares: 45, theme: 'Santé', ville: 'Parakou',
    images: ['https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80'],
  },
  {
    id: '5', author: '@GillesT', time: '12h', location: 'Lokossa',
    text: 'Réunion de quartier sur l\'électrification rurale : 3 nouveaux villages raccordés au réseau électrique ce mois-ci. Le développement avance ! ⚡',
    likes: 48, comments: 11, shares: 28, theme: 'Famille', ville: 'Lokossa',
    images: ['https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80'],
  },
  {
    id: '6', author: '@YvetteN', time: '1j', location: 'Ouidah',
    text: 'Festival des arts vodun : les préparatifs vont bon train pour la grande célébration de janvier. Artisans, musiciens et danseurs au rendez-vous ! 🎭',
    likes: 95, comments: 31, shares: 52, theme: 'Famille', ville: 'Ouidah',
    images: ['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80'],
  },
  {
    id: '7', author: '@RomainH', time: '2j', location: 'Cotonou',
    text: 'Signalement : panneaux publicitaires non conformes boulevard de la Marina. La régie municipale doit intervenir rapidement avant les intempéries.',
    likes: 33, comments: 17, shares: 8, theme: 'Environnement', ville: 'Cotonou',
    images: [],
  },
];

function PostCard({ item, onPress, onLike, index }) {
  const [liked, setLiked] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const lastTap = useRef(0);
  const [heartShow, setHeartShow] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 80, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: index * 80, useNativeDriver: false }),
    ]).start();
  }, []);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      if (!liked) {
        setLiked(true);
        onLike?.(item.id);
      }
      setHeartShow(true);
      setTimeout(() => setHeartShow(false), 600);
    }
    lastTap.current = now;
  };

  const ac = ACCENTS[index % ACCENTS.length];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={cd.card}>
        <View style={cd.cardGlow} />
        <View style={cd.head}>
          <View style={cd.authorRow}>
            <View style={[cd.avatarRing, { borderColor: ac + '50' }]}>
              <View style={[cd.avatar, { backgroundColor: ac + '15' }]}>
                <Text style={[cd.avatarLetter, { color: ac }]}>{item.author[1]}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={cd.authorMeta}>
                <Text style={cd.authorName}>{item.author}</Text>
                <View style={[cd.themeBadge, { backgroundColor: ac + '12' }]}>
                  <View style={[cd.themeDot, { backgroundColor: ac }]} />
                  <Text style={[cd.themeText, { color: ac }]}>{item.theme}</Text>
                </View>
              </View>
              <Text style={cd.timeLoc}>{item.time} · {item.location}</Text>
            </View>
          </View>
        </View>

        <Text style={cd.body}>{item.text}</Text>

        {item.images?.length > 0 && (
          <TouchableOpacity activeOpacity={0.95} onPress={handleDoubleTap}>
            <View style={cd.imgBox}>
              <Image source={{ uri: item.images[0] }} style={cd.img} resizeMode="cover" />
              <View style={cd.imgOverlay} />
              <View style={cd.locBadge}>
                <Text style={cd.locBadgeText}>📍 {item.location}</Text>
              </View>
              {heartShow && (
                <View style={cd.heartBurst}>
                  <Text style={cd.heartBurstText}>❤️</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        <View style={cd.divider} />

        <View style={cd.actions}>
          <TouchableOpacity
            style={cd.actionBtn}
            onPress={() => { setLiked(v => !v); onLike?.(item.id); }}
          >
            <Text style={cd.actionIcon}>{liked ? '❤️' : '🤍'}</Text>
            <Text style={[cd.actionCount, liked && cd.likedCount]}>{liked ? item.likes + 1 : item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.actionBtn} onPress={() => onPress(item)}>
            <Text style={cd.actionIcon}>💬</Text>
            <Text style={cd.actionCount}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.actionBtn}>
            <Text style={cd.actionIcon}>↗</Text>
            <Text style={cd.actionCount}>{item.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.saveBtn}>
            <Text style={cd.saveIcon}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const cd = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, shadowRadius: 24, elevation: 5,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute', top: -60, right: -60,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(245,166,35,0.04)',
  },
  head: { marginBottom: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  avatarRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 17, fontWeight: '700' },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  themeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  themeDot: { width: 5, height: 5, borderRadius: 3 },
  themeText: { fontSize: 11, fontWeight: '600' },
  timeLoc: { fontSize: 12, color: '#B0A89A', marginTop: 2 },
  body: { fontSize: 15, color: '#1A1A1A', lineHeight: 24, letterSpacing: 0.1 },
  imgBox: { position: 'relative', marginTop: 14, borderRadius: 16, overflow: 'hidden' },
  img: { width: '100%', height: 240 },
  imgOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  locBadge: {
    position: 'absolute', bottom: 10, left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10,
  },
  locBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  heartBurst: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  heartBurstText: { fontSize: 80 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 16 },
  actionCount: { fontSize: 13, color: '#8A8272', fontWeight: '600' },
  likedCount: { color: '#E74C3C' },
  saveBtn: { marginLeft: 'auto', opacity: 0.4 },
  saveIcon: { fontSize: 15 },
});

function StepDot({ step, current, label }) {
  const isActive = current >= step;
  const isNow = current === step;
  return (
    <View style={sd.row}>
      <View style={[sd.dot, isActive && sd.dotActive, isNow && sd.dotNow]}>
        <Text style={[sd.dotText, isActive && sd.dotTextActive]}>
          {isNow ? '●' : isActive ? '✓' : '○'}
        </Text>
      </View>
      <Text style={[sd.label, isActive && sd.labelActive]}>{label}</Text>
    </View>
  );
}

const sd = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  dotActive: { backgroundColor: '#2E86C1' },
  dotNow: { backgroundColor: '#2E86C1', transform: [{ scale: 1.2 }] },
  dotText: { fontSize: 12, color: '#B0A89A' },
  dotTextActive: { color: '#FFF' },
  label: { fontSize: 12, color: '#B0A89A', fontWeight: '500' },
  labelActive: { color: '#2E86C1', fontWeight: '600' },
});

export default function PostsReseaux() {
  const [filterVille, setFilterVille] = useState('Toutes');
  const [filterTheme, setFilterTheme] = useState('Tous');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(null);
  const [newPostText, setNewPostText] = useState('');
  const [newPostTheme, setNewPostTheme] = useState('Urbanisme');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [createStep, setCreateStep] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const filteredPosts = posts.filter(p => {
    if (filterVille !== 'Toutes' && p.ville !== filterVille) return false;
    if (filterTheme !== 'Tous' && p.theme !== filterTheme) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.text.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
    }
    return true;
  });

  const handleLike = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const toggleMedia = (img) => {
    setSelectedMedia(prev => {
      const exists = prev.find(p => p.id === img.id);
      if (exists) return prev.filter(p => p.id !== img.id);
      if (prev.length >= 6) { Alert.alert('Limite', '6 photos max.'); return prev; }
      return [...prev, { ...img }];
    });
  };

  const handlePublish = () => {
    if (!newPostText.trim() && selectedMedia.length === 0) {
      Alert.alert('Contenu requis', 'Ajoutez du texte ou une photo.');
      return;
    }
    setPosts(prev => [{
      id: String(Date.now()), author: '@Moi', time: 'à l\'instant',
      location: 'Cotonou', text: newPostText || '📸 Nouvelle publication',
      likes: 0, comments: 0, shares: 0, theme: newPostTheme, ville: 'Cotonou',
      images: selectedMedia.map(m => m.uri),
    }, ...prev]);
    setNewPostText(''); setSelectedMedia([]); setShowCreatePost(false); setCreateStep(1);
  };

  return (
    <View style={s.root}>
      <View style={s.bgOrb1} /><View style={s.bgOrb2} /><View style={s.bgOrb3} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerContent}>
          <Image source={{ uri: '/aanid_logo.jpeg' }} style={s.logoImg} resizeMode="contain" />
          <View style={s.headerRight}>
            <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnText}>🔔</Text></TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnText}>👤</Text></TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        style={s.list}
        data={filteredPosts}
        renderItem={({ item, index }) => (
          <PostCard item={item} index={index} onPress={setShowPostDetail} onLike={handleLike} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2E86C1"
            colors={['#2E86C1', '#2ECC71', '#F5A623']}
            progressBackgroundColor="#FFF"
          />
        }
        ListHeaderComponent={
          <View>
            <View style={s.hero}>
              <Text style={s.heroPre}>● Fil d'actualité</Text>
              <Text style={s.heroTitle}>Posts & Réseaux</Text>
              <View style={s.heroStats}>
                <View style={s.heroStat}>
                  <Text style={s.heroStatNum}>{posts.length}</Text>
                  <Text style={s.heroStatLabel}>posts</Text>
                </View>
                <View style={s.heroStatDiv} />
                <View style={s.heroStat}>
                  <Text style={s.heroStatNum}>{VILLES.length - 1}</Text>
                  <Text style={s.heroStatLabel}>villes</Text>
                </View>
                <View style={s.heroStatDiv} />
                <View style={s.heroStat}>
                  <Text style={s.heroStatNum}>{THEMES.length - 1}</Text>
                  <Text style={s.heroStatLabel}>thèmes</Text>
                </View>
              </View>
            </View>

            <View style={s.searchRow}>
              <View style={s.searchWrap}>
                <Text style={s.searchIcon}>🔍</Text>
                <TextInput
                  style={s.searchInput}
                  placeholder="Rechercher par ville, thème..."
                  placeholderTextColor="rgba(0,0,0,0.22)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={s.filterBtn} onPress={() => setShowFilters(v => !v)}>
                  <Text style={[s.filterIcon, showFilters && { color: '#2E86C1' }]}>☰</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showFilters && (
              <View style={s.filtersWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {VILLES.map(v => (
                    <TouchableOpacity key={v} style={[s.chip, filterVille === v && s.chipOn]} onPress={() => setFilterVille(v)}>
                      <Text style={[s.chipText, filterVille === v && s.chipTextOn]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {THEMES.map(t => (
                    <TouchableOpacity key={t} style={[s.chip, filterTheme === t && s.chipOn]} onPress={() => setFilterTheme(t)}>
                      <Text style={[s.chipText, filterTheme === t && s.chipTextOn]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyGlow}><Text style={s.emptyIcon}>🌍</Text></View>
            <Text style={s.emptyTitle}>Aucun post trouvé</Text>
            <Text style={s.emptyDesc}>Modifie tes filtres ou explore d'autres villes du Bénin.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => { setFilterVille('Toutes'); setFilterTheme('Tous'); setSearchQuery(''); }}>
              <Text style={s.emptyBtnText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity style={s.fab} onPress={() => setShowCreatePost(true)} activeOpacity={0.85}>
        <View style={s.fabInner}><Text style={s.fabIcon}>+</Text></View>
      </TouchableOpacity>

      {/* ─── CREATE POST ─── */}
      <Modal visible={showCreatePost} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <TouchableOpacity onPress={() => { setShowCreatePost(false); setSelectedMedia([]); setNewPostText(''); setCreateStep(1); }}>
                <Text style={s.modalCancel}>Annuler</Text>
              </TouchableOpacity>
              <Text style={s.modalTitle}>Nouveau post</Text>
              <TouchableOpacity
                style={[s.publishBtn, (selectedMedia.length === 0 && !newPostText.trim()) && s.dim]}
                onPress={handlePublish}
              >
                <Text style={s.publishBtnText}>Partager</Text>
              </TouchableOpacity>
            </View>

            <View style={s.stepsBar}>
              <StepDot step={1} current={createStep} label="Média" />
              <View style={s.stepsDash} />
              <StepDot step={2} current={createStep} label="Légende" />
              <View style={s.stepsDash} />
              <StepDot step={3} current={createStep} label="Publier" />
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {selectedMedia.length > 0 ? (
                <View style={cp.previewWrap}>
                  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                    {selectedMedia.map((m, i) => (
                      <View key={m.id} style={cp.previewPage}>
                        <Image source={{ uri: m.uri }} style={cp.previewImg} resizeMode="cover" />
                        <TouchableOpacity style={cp.removeBtn} onPress={() => setSelectedMedia(prev => prev.filter(p => p.id !== m.id))}>
                          <Text style={cp.removeBtnText}>✕</Text>
                        </TouchableOpacity>
                        <View style={cp.counterBadge}><Text style={cp.counterText}>{i + 1}/{selectedMedia.length}</Text></View>
                      </View>
                    ))}
                  </ScrollView>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={cp.thumbRow}>
                    {selectedMedia.map(m => <Image key={m.id} source={{ uri: m.uri }} style={cp.thumb} resizeMode="cover" />)}
                    <TouchableOpacity style={cp.addMore} onPress={() => setShowMediaPicker(true)}>
                      <Text style={cp.addMoreIcon}>+</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              ) : (
                <TouchableOpacity style={cp.addMedia} onPress={() => setShowMediaPicker(true)}>
                  <View style={cp.addMediaCircle}><Text style={cp.addMediaIcon}>📷</Text></View>
                  <Text style={cp.addMediaTitle}>Ajouter des photos</Text>
                  <Text style={cp.addMediaSub}>Jusqu'à 6 photos · Galerie</Text>
                </TouchableOpacity>
              )}

              <View style={cp.captionRow}>
                <View style={cp.captionAvatar}><Text style={cp.captionAvatarText}>M</Text></View>
                <TextInput
                  style={cp.captionInput}
                  placeholder="Écris une légende..."
                  placeholderTextColor="rgba(0,0,0,0.2)"
                  multiline value={newPostText}
                  onChangeText={setNewPostText}
                  maxLength={500}
                  onFocus={() => setCreateStep(2)}
                />
              </View>

              <View style={cp.options}>
                <View style={cp.optRow}>
                  <Text style={cp.optLabel}>📍 Localisation</Text>
                  <Text style={cp.optValue}>Cotonou, Bénin</Text>
                </View>
                <View style={cp.optDiv} />
                <View style={cp.optRow}>
                  <Text style={cp.optLabel}>🏷️ Thème</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {THEMES.filter(t => t !== 'Tous').map(t => (
                      <TouchableOpacity key={t} style={[cp.themeChip, newPostTheme === t && cp.themeChipOn]} onPress={() => setNewPostTheme(t)}>
                        <Text style={[cp.themeChipText, newPostTheme === t && cp.themeChipTextOn]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={cp.optDiv} />
                <View style={cp.optRow}>
                  <Text style={cp.optLabel}>🔒 Visibilité</Text>
                  <Text style={cp.optValue}>Public</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[cp.publishBar, (selectedMedia.length === 0 && !newPostText.trim()) && s.dim]}
              onPress={handlePublish}
            >
              <Text style={cp.publishBarText}>
                {selectedMedia.length > 0 ? `Publier ${selectedMedia.length} photo${selectedMedia.length > 1 ? 's' : ''}` : 'Publier'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── MEDIA PICKER ─── */}
      <Modal visible={showMediaPicker} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.modal, { maxHeight: '90%' }]}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <TouchableOpacity onPress={() => setShowMediaPicker(false)}><Text style={s.modalCancel}>Annuler</Text></TouchableOpacity>
              <Text style={s.modalTitle}>Galerie</Text>
              <TouchableOpacity onPress={() => { setCreateStep(1); setShowMediaPicker(false); }}>
                <Text style={[s.modalCancel, { fontWeight: '600' }]}>OK</Text>
              </TouchableOpacity>
            </View>
            <View style={gp.stats}>
              <Text style={gp.statsText}>{selectedMedia.length} sélectionnée{selectedMedia.length > 1 ? 's' : ''}</Text>
            </View>
            <FlatList
              data={GALLERY_IMAGES} numColumns={3}
              renderItem={({ item }) => {
                const sel = selectedMedia.find(p => p.id === item.id);
                return (
                  <TouchableOpacity style={gp.item} onPress={() => toggleMedia(item)}>
                    <Image source={{ uri: item.uri }} style={gp.img} resizeMode="cover" />
                    {sel && (
                      <View style={gp.overlay}>
                        <View style={gp.check}><Text style={gp.checkText}>✓</Text></View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      </Modal>

      {/* ─── POST DETAIL ─── */}
      <Modal visible={!!showPostDetail} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.modal, { maxHeight: '94%' }]}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <TouchableOpacity onPress={() => setShowPostDetail(null)}><Text style={s.modalCancel}>← Retour</Text></TouchableOpacity>
              <Text style={s.modalTitle}>Publication</Text>
              <TouchableOpacity onPress={() => Alert.alert('Options', 'Signaler · Partager · Copier')}>
                <Text style={s.modalCancel}>•••</Text>
              </TouchableOpacity>
            </View>
            {showPostDetail && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={s.detailHead}>
                  <View style={[s.detailRing, { borderColor: ACCENTS[0] + '50' }]}>
                    <View style={[s.detailAvatar, { backgroundColor: ACCENTS[0] + '15' }]}>
                      <Text style={[s.detailAvatarText, { color: ACCENTS[0] }]}>{showPostDetail.author[1]}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailAuthor}>{showPostDetail.author}</Text>
                    <Text style={s.detailMeta}>{showPostDetail.time} · 📍 {showPostDetail.location}</Text>
                  </View>
                  <View style={[s.detailBadge, { backgroundColor: ACCENTS[0] + '12' }]}>
                    <Text style={[s.detailBadgeText, { color: ACCENTS[0] }]}>{showPostDetail.theme}</Text>
                  </View>
                </View>
                <Text style={s.detailBody}>{showPostDetail.text}</Text>
                {showPostDetail.images?.length > 0 && (
                  <View style={s.detailImgWrap}>
                    <Image source={{ uri: showPostDetail.images[0] }} style={s.detailImg} resizeMode="cover" />
                    <View style={s.detailImgOverlay} />
                    <View style={s.detailLocBadge}><Text style={s.detailLocBadgeText}>📍 {showPostDetail.location}</Text></View>
                  </View>
                )}
                <View style={s.detailDiv} />
                <View style={s.detailActions}>
                  {['❤️', '💬', '↗'].map((ico, i) => (
                    <TouchableOpacity key={i} style={s.detailAction}>
                      <Text style={s.detailActionIcon}>{ico}</Text>
                      <Text style={s.detailActionCount}>{[showPostDetail.likes, showPostDetail.comments, showPostDetail.shares][i]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.commentsSection}>
                  <Text style={s.commentsTitle}>Commentaires</Text>
                  {[
                    { author: '@PaulT', text: 'Super initiative pour Cotonou ! 🇧🇯', likes: 5, time: '2h' },
                    { author: '@KoffiB', text: 'Quand à Parakou ?', likes: 2, time: '1h' },
                    { author: '@MariamB', text: 'Enfin une bonne nouvelle ✨', likes: 8, time: '30min' },
                  ].map((c, i) => (
                    <View key={i} style={s.comment}>
                      <View style={[s.commentAvatar, { backgroundColor: ACCENTS[i] + '15' }]}>
                        <Text style={[s.commentAvatarText, { color: ACCENTS[i] }]}>{c.author[1]}</Text>
                      </View>
                      <View style={s.commentBody}>
                        <View style={s.commentHead}>
                          <Text style={s.commentAuthor}>{c.author}</Text>
                          <Text style={s.commentTime}>{c.time}</Text>
                        </View>
                        <Text style={s.commentText}>{c.text}</Text>
                        <View style={s.commentActions}>
                          <Text style={s.commentAction}>♥ {c.likes}</Text>
                          <Text style={s.commentAction}>Répondre</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
            {showPostDetail && (
              <View style={s.commentInput}>
                <TextInput
                  style={s.commentInputField}
                  placeholder="Écrire un commentaire..."
                  placeholderTextColor="rgba(0,0,0,0.25)"
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity
                  style={[s.commentSend, !commentText.trim() && s.dim]}
                  onPress={() => { if (commentText.trim()) { Alert.alert('✓ Commentaire ajouté'); setCommentText(''); } }}
                >
                  <Text style={s.commentSendText}>→</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5DC' },
  dim: { opacity: 0.4 },
  bgOrb1: { position: 'absolute', top: -120, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(245,166,35,0.05)' },
  bgOrb2: { position: 'absolute', top: 350, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(46,134,193,0.03)' },
  bgOrb3: { position: 'absolute', bottom: 200, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(46,134,193,0.04)' },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  logoImg: { width: 28, height: 28 },
  headerRight: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.04)', justifyContent: 'center', alignItems: 'center' },
  iconBtnText: { fontSize: 16 },
  list: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 120 },
  hero: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  heroPre: { fontSize: 12, fontWeight: '600', color: '#8A8272', letterSpacing: 1.5, marginBottom: 6 },
  heroTitle: { fontSize: 34, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.8 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 16, padding: 16, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  heroStat: { alignItems: 'center', paddingHorizontal: 12 },
  heroStatDiv: { width: 1, height: 28, backgroundColor: 'rgba(0,0,0,0.06)' },
  heroStatNum: { fontSize: 19, fontWeight: '800', color: '#1A1A1A' },
  heroStatLabel: { fontSize: 11, color: '#B0A89A', fontWeight: '500', marginTop: 2 },
  searchRow: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 16, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  searchIcon: { fontSize: 14, marginRight: 10, opacity: 0.35 },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A', outlineStyle: 'none' },
  filterBtn: { padding: 6 },
  filterIcon: { fontSize: 18, color: '#B0A89A' },
  filtersWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.72)', marginRight: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  chipOn: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  chipText: { fontSize: 13, color: '#8A8272', fontWeight: '500' },
  chipTextOn: { color: '#FFF' },
  fab: { position: 'absolute', bottom: 28, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#2E86C1', shadowColor: '#2E86C1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8, justifyContent: 'center', alignItems: 'center' },
  fabInner: { justifyContent: 'center', alignItems: 'center' },
  fabIcon: { fontSize: 30, color: '#FFF', fontWeight: '300', marginTop: -2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 40 },
  emptyGlow: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245,166,35,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyIcon: { fontSize: 36, opacity: 0.3 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#B0A89A', textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 20, backgroundColor: '#1A1A1A', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#F5F5DC', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '92%', paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 16 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalCancel: { fontSize: 15, color: '#8A8272', fontWeight: '500' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  publishBtn: { backgroundColor: '#2E86C1', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  publishBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  stepsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  stepsDash: { width: 30, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  detailRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  detailAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  detailAvatarText: { fontSize: 17, fontWeight: '700' },
  detailAuthor: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  detailMeta: { fontSize: 12, color: '#B0A89A', marginTop: 1 },
  detailBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  detailBadgeText: { fontSize: 12, fontWeight: '600' },
  detailBody: { fontSize: 15, color: '#1A1A1A', lineHeight: 24, marginBottom: 14 },
  detailImgWrap: { position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  detailImg: { width: '100%', height: 280 },
  detailImgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(0,0,0,0.2)' },
  detailLocBadge: { position: 'absolute', bottom: 10, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  detailLocBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  detailDiv: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 16 },
  detailActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  detailAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailActionIcon: { fontSize: 16 },
  detailActionCount: { fontSize: 13, color: '#8A8272', fontWeight: '600' },
  commentsSection: { marginTop: 24 },
  commentsTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  comment: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { fontSize: 14, fontWeight: '600' },
  commentBody: { flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 12 },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  commentTime: { fontSize: 11, color: '#B0A89A' },
  commentText: { fontSize: 14, color: '#5A5242', lineHeight: 20 },
  commentActions: { flexDirection: 'row', gap: 14, marginTop: 6 },
  commentAction: { fontSize: 12, color: '#8A8272', fontWeight: '500' },
  commentInput: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 16, padding: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  commentInputField: { flex: 1, fontSize: 14, color: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 8 },
  commentSend: { backgroundColor: '#2E86C1', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  commentSendText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});

const cp = StyleSheet.create({
  previewWrap: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#000' },
  previewPage: { width: width - 48, height: width - 48, position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  counterBadge: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  counterText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  thumbRow: { flexDirection: 'row', padding: 8, gap: 6 },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  addMore: { width: 40, height: 40, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  addMoreIcon: { color: '#FFF', fontSize: 20, fontWeight: '300' },
  addMedia: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, borderWidth: 2, borderColor: 'rgba(0,0,0,0.06)', borderStyle: 'dashed', padding: 40, alignItems: 'center', marginBottom: 16 },
  addMediaCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0EDE0', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  addMediaIcon: { fontSize: 26 },
  addMediaTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  addMediaSub: { fontSize: 13, color: '#B0A89A' },
  captionRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 16 },
  captionAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EDE0', justifyContent: 'center', alignItems: 'center' },
  captionAvatarText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  captionInput: { flex: 1, fontSize: 15, color: '#1A1A1A', lineHeight: 22, maxHeight: 100, paddingTop: 6 },
  options: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 4, marginBottom: 16 },
  optRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  optLabel: { fontSize: 15, color: '#1A1A1A' },
  optValue: { fontSize: 14, color: '#2E86C1', fontWeight: '500' },
  optDiv: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginHorizontal: 16 },
  themeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', marginLeft: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  themeChipOn: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  themeChipText: { fontSize: 12, color: '#8A8272', fontWeight: '500' },
  themeChipTextOn: { color: '#FFF' },
  publishBar: { backgroundColor: '#2E86C1', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  publishBarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

const gp = StyleSheet.create({
  stats: { paddingHorizontal: 4, paddingBottom: 12 },
  statsText: { fontSize: 13, color: '#8A8272', fontWeight: '500' },
  item: { width: (width - 48 - 16) / 3, height: (width - 48 - 16) / 3, margin: 2, borderRadius: 8, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(46,134,193,0.3)', justifyContent: 'center', alignItems: 'center' },
  check: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#2E86C1', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  checkText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
