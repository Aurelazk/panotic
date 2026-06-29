import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, SafeAreaView, ScrollView, Alert, Animated, Dimensions, Image,
  RefreshControl, StatusBar,
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

function ShimmerBlock({ w, h, r }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  return <Animated.View style={{ opacity, width: w || '100%', height: h, borderRadius: r || 8, backgroundColor: '#E8E4D0' }} />;
}

function SkeletonPost() {
  return (
    <View style={cd.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <ShimmerBlock w={44} h={44} r={22} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <ShimmerBlock w={120} h={14} r={4} />
          <View style={{ height: 6 }} />
          <ShimmerBlock w={80} h={11} r={4} />
        </View>
      </View>
      <ShimmerBlock w={'100%'} h={14} r={4} />
      <View style={{ height: 6 }} />
      <ShimmerBlock w={'85%'} h={14} r={4} />
      <View style={{ height: 6 }} />
      <ShimmerBlock w={'60%'} h={14} r={4} />
      <View style={{ height: 14 }} />
      <ShimmerBlock w={'100%'} h={200} r={14} />
      <View style={{ height: 14 }} />
      <View style={{ flexDirection: 'row', gap: 24 }}>
        <ShimmerBlock w={60} h={14} r={4} />
        <ShimmerBlock w={60} h={14} r={4} />
      </View>
    </View>
  );
}

function LikeButton({ count, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(false);

  const handlePress = () => {
    setLiked(v => !v);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={act.row} activeOpacity={0.6}>
      <View style={[act.wrap, liked && act.wrapLiked]}>
        <Animated.Text style={[act.ico, liked && act.liked, { transform: [{ scale }] }]}>
          {liked ? '❤️' : '🤍'}
        </Animated.Text>
      </View>
      <Text style={[act.count, liked && act.likedCount]}>{liked ? count + 1 : count}</Text>
    </TouchableOpacity>
  );
}

const act = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  wrap: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  wrapLiked: { backgroundColor: 'rgba(231,76,60,0.1)' },
  ico: { fontSize: 15 },
  liked: { fontSize: 17 },
  count: { fontSize: 13, color: '#8A8272', fontWeight: '600' },
  likedCount: { color: '#E74C3C' },
});

function ImageWithTint({ uri, style, location }) {
  return (
    <View style={[iwt.wrap, style]}>
      <Image source={{ uri }} style={iwt.img} resizeMode="cover" />
      <View style={iwt.gradient} />
      {location && (
        <View style={iwt.badge}>
          <Text style={iwt.badgeText}>📍 {location}</Text>
        </View>
      )}
    </View>
  );
}

const iwt = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  gradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  badge: {
    position: 'absolute', bottom: 10, left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10,
  },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
});

function PostCard({ item, onPress, onLike, onDoubleTapLike, index }) {
  const fade = useRef(new Animated.Value(0)).current;
  const up = useRef(new Animated.Value(24)).current;
  const heartPop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay: index * 80, useNativeDriver: true }),
      Animated.timing(up, { toValue: 0, duration: 500, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const triggerDoubleTapHeart = () => {
    heartPop.setValue(0);
    Animated.sequence([
      Animated.timing(heartPop, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(heartPop, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    onDoubleTapLike?.(item.id);
  };

  const lastTap = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      triggerDoubleTapHeart();
    }
    lastTap.current = now;
  };

  const ac = ACCENTS[item.author.charCodeAt(3) % ACCENTS.length];
  const heartScale = heartPop.interpolate({ inputRange: [0, 1], outputRange: [0, 1.3] });
  const heartOpacity = heartPop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: up }] }}>
      <TouchableOpacity
        style={cd.card}
        activeOpacity={0.96}
        onPress={() => onPress(item)}
        onLongPress={() => onPress(item)}
      >
        <View style={cd.ambientGlow} />
        <View style={cd.head}>
          <View style={cd.author}>
            <View style={[cd.avatarRing, { borderColor: ac + '40' }]}>
              <View style={[cd.avatar, { backgroundColor: ac + '15' }]}>
                <Text style={[cd.avatarLetter, { color: ac }]}>{item.author[1]}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={cd.authorRow}>
                <Text style={cd.authorName}>{item.author}</Text>
                <View style={[cd.badge, { backgroundColor: ac + '12' }]}>
                  <View style={[cd.badgeDot, { backgroundColor: ac }]} />
                  <Text style={[cd.badgeText, { color: ac }]}>{item.theme}</Text>
                </View>
              </View>
              <Text style={cd.meta}>{item.time} · {item.location}</Text>
            </View>
          </View>
        </View>
        <Text style={cd.body}>{item.text}</Text>
        {item.images?.length > 0 && (
          <TouchableOpacity activeOpacity={0.95} onPress={handleDoubleTap}>
            <View style={cd.imgWrap}>
              <ImageWithTint uri={item.images[0]} style={cd.img} location={item.location} />
              <Animated.View style={[cd.doubleTapHeart, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}>
                <Text style={cd.doubleTapHeartText}>❤️</Text>
              </Animated.View>
            </View>
          </TouchableOpacity>
        )}
        <View style={cd.div} />
        <View style={cd.actions}>
          <LikeButton count={item.likes} onPress={() => onLike?.(item.id)} />
          <TouchableOpacity style={cd.action} onPress={() => onPress(item)}>
            <View style={cd.actionBg}><Text style={cd.actionIco}>💬</Text></View>
            <Text style={cd.actionCount}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.action}>
            <View style={cd.actionBg}><Text style={cd.actionIco}>↗</Text></View>
            <Text style={cd.actionCount}>{item.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cd.bookmark}>
            <Text style={cd.bookmarkIco}>🔖</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cd = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07, shadowRadius: 20, elevation: 4,
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute', top: -50, right: -50,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(245,166,35,0.04)',
  },
  head: { marginBottom: 10 },
  author: { flexDirection: 'row', alignItems: 'center' },
  avatarRing: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 17, fontWeight: '700' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  meta: { fontSize: 12, color: '#B0A89A', marginTop: 2 },
  body: { fontSize: 15, color: '#1A1A1A', lineHeight: 24, letterSpacing: 0.1 },
  imgWrap: { position: 'relative', marginTop: 14 },
  img: { width: '100%', height: 230, borderRadius: 16 },
  doubleTapHeart: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  doubleTapHeartText: { fontSize: 72 },
  div: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBg: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center' },
  actionIco: { fontSize: 14 },
  actionCount: { fontSize: 13, color: '#8A8272', fontWeight: '600' },
  bookmark: { marginLeft: 'auto', opacity: 0.4 },
  bookmarkIco: { fontSize: 15 },
});

function CreatePostStep({ step, current, label }) {
  const isActive = current >= step;
  const isNow = current === step;
  return (
    <View style={cps.row}>
      <View style={[cps.dot, isActive && cps.dotActive, isNow && cps.dotNow]}>
        <Text style={[cps.dotText, isActive && cps.dotTextActive]}>{isNow ? '●' : isActive ? '✓' : '○'}</Text>
      </View>
      <Text style={[cps.label, isActive && cps.labelActive]}>{label}</Text>
    </View>
  );
}

const cps = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  dotActive: { backgroundColor: '#2E86C1' },
  dotNow: { backgroundColor: '#2E86C1', transform: [{ scale: 1.15 }] },
  dotText: { fontSize: 11, color: '#B0A89A' },
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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createStep, setCreateStep] = useState(1);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredPosts = posts.filter(p => {
    if (filterVille !== 'Toutes' && p.ville !== filterVille) return false;
    if (filterTheme !== 'Tous' && p.theme !== filterTheme) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.text.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
    }
    return true;
  });

  const handleLike = useCallback((postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  }, []);

  const handleDoubleTapLike = useCallback((postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const toggleMediaSelect = (img) => {
    setSelectedMedia(prev => {
      const exists = prev.find(p => p.id === img.id);
      if (exists) return prev.filter(p => p.id !== img.id);
      if (prev.length >= 6) { Alert.alert('Limite', '6 photos maximum.'); return prev; }
      return [...prev, img];
    });
  };

  const handlePublish = () => {
    if (!newPostText.trim() && selectedMedia.length === 0) {
      Alert.alert('Contenu requis', 'Ajoutez du texte ou une photo.');
      return;
    }
    const newPost = {
      id: String(Date.now()), author: '@Moi', time: 'à l\'instant',
      location: 'Cotonou', text: newPostText || '📸 Nouvelle publication',
      likes: 0, comments: 0, shares: 0,
      theme: newPostTheme, ville: 'Cotonou',
      images: selectedMedia.map(m => m.uri),
    };
    setPosts(prev => [newPost, ...prev]);
    setNewPostText(''); setSelectedMedia([]); setShowCreatePost(false); setCreateStep(1);
  };

  const handleScroll = useCallback((e) => {
    scrollY.setValue(e.nativeEvent.contentOffset.y);
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5DC" />
      <View style={s.container}>
        <View style={s.bgOrb1} /><View style={s.bgOrb2} /><View style={s.bgOrb3} />

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerContent}>
            <View style={s.logoWrap}>
              <Text style={s.logoAccent}>✦</Text>
              <Text style={s.logo}>aanid</Text>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnText}>🔔</Text></TouchableOpacity>
              <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnText}>👤</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          data={loading ? Array(3).fill(null) : filteredPosts}
          renderItem={({ item, index }) =>
            loading ? <SkeletonPost /> : (
              <PostCard
                item={item}
                index={index}
                onPress={setShowPostDetail}
                onLike={handleLike}
                onDoubleTapLike={handleDoubleTapLike}
              />
            )
          }
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
              {/* Hero */}
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

              {/* Search */}
              <View style={s.searchRow}>
                <View style={s.searchWrap}>
                  <Text style={s.searchIco}>🔍</Text>
                  <TextInput
                    style={s.searchInput}
                    placeholder="Cotonou, Parakou, Environnement..."
                    placeholderTextColor="rgba(0,0,0,0.2)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity onPress={() => setShowFilters(v => !v)} style={s.searchFilterBtn}>
                    <Text style={[s.searchFilterIco, showFilters && { color: '#2E86C1' }]}>☰</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filters */}
              {showFilters && (
                <View style={s.filtersWrap}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {VILLES.map(v => (
                      <TouchableOpacity
                        key={v}
                        style={[s.chip, filterVille === v && s.chipOn]}
                        onPress={() => setFilterVille(v)}
                      >
                        <Text style={[s.chipText, filterVille === v && s.chipTextOn]}>{v}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    {THEMES.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[s.chip, filterTheme === t && s.chipOn]}
                        onPress={() => setFilterTheme(t)}
                      >
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
              <View style={s.emptyGlow}>
                <Text style={s.emptyIcon}>🌍</Text>
              </View>
              <Text style={s.emptyTitle}>Aucun post trouvé</Text>
              <Text style={s.emptyDesc}>Essayez de modifier vos filtres ou explorez d'autres villes du Bénin.</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => { setFilterVille('Toutes'); setFilterTheme('Tous'); setSearchQuery(''); }}
              >
                <Text style={s.emptyBtnText}>Réinitialiser les filtres</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* FAB */}
        <TouchableOpacity style={s.fab} onPress={() => setShowCreatePost(true)} activeOpacity={0.85}>
          <View style={s.fabPulse} />
          <View style={s.fabInner}><Text style={s.fabIco}>+</Text></View>
        </TouchableOpacity>

        {/* ───────────────── CREATE POST ───────────────── */}
        <Modal visible={showCreatePost} animationType="slide" transparent>
          <View style={s.overlay}>
            <View style={s.modal}>
              <View style={s.modalHandle} />
              <View style={s.modalHead}>
                <TouchableOpacity onPress={() => { setShowCreatePost(false); setSelectedMedia([]); setNewPostText(''); setCreateStep(1); }}>
                  <Text style={s.modalCancel}>Annuler</Text>
                </TouchableOpacity>
                <Text style={s.modalTitle}>Créer un post</Text>
                <TouchableOpacity
                  style={[s.publishSmall, (selectedMedia.length === 0 && !newPostText.trim()) && { opacity: 0.3 }]}
                  onPress={handlePublish}
                  disabled={selectedMedia.length === 0 && !newPostText.trim()}
                >
                  <Text style={s.publishSmallText}>Partager</Text>
                </TouchableOpacity>
              </View>

              {/* Steps indicator */}
              <View style={s.stepsRow}>
                <CreatePostStep step={1} current={createStep} label="Média" />
                <View style={s.stepsLine} />
                <CreatePostStep step={2} current={createStep} label="Légende" />
                <View style={s.stepsLine} />
                <CreatePostStep step={3} current={createStep} label="Partager" />
              </View>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Media */}
                {selectedMedia.length > 0 ? (
                  <View style={cp.previewContainer}>
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
                      {selectedMedia.map((m, i) => (
                        <Image key={m.id} source={{ uri: m.uri }} style={cp.thumb} resizeMode="cover" />
                      ))}
                      <TouchableOpacity style={cp.addMoreBtn} onPress={() => setShowMediaPicker(true)}>
                        <Text style={cp.addMoreText}>+</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                ) : (
                  <TouchableOpacity style={cp.addMediaBtn} onPress={() => setShowMediaPicker(true)}>
                    <View style={cp.addMediaIconWrap}>
                      <Text style={cp.addMediaIcon}>📷</Text>
                    </View>
                    <Text style={cp.addMediaTitle}>Ajouter des photos</Text>
                    <Text style={cp.addMediaSub}>Jusqu'à 6 photos · Galerie</Text>
                    <TouchableOpacity
                      style={cp.browseBtn}
                      onPress={() => setShowMediaPicker(true)}
                    >
                      <Text style={cp.browseBtnText}>Parcourir la galerie</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}

                {/* Caption */}
                <View style={cp.captionRow}>
                  <View style={cp.captionAvatar}><Text style={cp.captionAvatarText}>M</Text></View>
                  <TextInput
                    style={cp.captionInput}
                    placeholder="Écrivez une légende..."
                    placeholderTextColor="rgba(0,0,0,0.2)"
                    multiline
                    value={newPostText}
                    onChangeText={setNewPostText}
                    maxLength={500}
                    onFocus={() => setCreateStep(2)}
                  />
                </View>

                {/* Options */}
                <View style={cp.options}>
                  <View style={cp.optionRow}>
                    <Text style={cp.optionLabel}>📍 Localisation</Text>
                    <TouchableOpacity style={cp.optionValue}>
                      <Text style={cp.optionValueText}>Cotonou, Bénin</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={cp.optionDiv} />
                  <View style={cp.optionRow}>
                    <Text style={cp.optionLabel}>🏷️ Thème</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {THEMES.filter(t => t !== 'Tous').map(t => (
                        <TouchableOpacity
                          key={t}
                          style={[cp.themeChip, newPostTheme === t && cp.themeChipOn]}
                          onPress={() => setNewPostTheme(t)}
                        >
                          <Text style={[cp.themeChipText, newPostTheme === t && cp.themeChipTextOn]}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={cp.optionDiv} />
                  <View style={cp.optionRow}>
                    <Text style={cp.optionLabel}>🔒 Visibilité</Text>
                    <Text style={cp.optionValueText}>Public</Text>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom publish */}
              <TouchableOpacity
                style={[cp.bottomPublish, (selectedMedia.length === 0 && !newPostText.trim()) && { opacity: 0.4 }]}
                onPress={handlePublish}
                disabled={selectedMedia.length === 0 && !newPostText.trim()}
              >
                <Text style={cp.bottomPublishText}>
                  {selectedMedia.length > 0 ? `Publier ${selectedMedia.length} photo${selectedMedia.length > 1 ? 's' : ''}` : 'Publier'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ───────────────── MEDIA PICKER ───────────────── */}
        <Modal visible={showMediaPicker} animationType="slide" transparent>
          <View style={s.overlay}>
            <View style={[s.modal, { maxHeight: '90%' }]}>
              <View style={s.modalHandle} />
              <View style={s.modalHead}>
                <TouchableOpacity onPress={() => setShowMediaPicker(false)}>
                  <Text style={s.modalCancel}>Annuler</Text>
                </TouchableOpacity>
                <Text style={s.modalTitle}>Galerie</Text>
                <TouchableOpacity onPress={() => { setCreateStep(1); setShowMediaPicker(false); }}>
                  <Text style={[s.modalCancel, { fontWeight: '600' }]}>OK</Text>
                </TouchableOpacity>
              </View>

              <View style={gp.stats}>
                <Text style={gp.statsText}>{selectedMedia.length} sélectionnée{selectedMedia.length > 1 ? 's' : ''}</Text>
              </View>

              <FlatList
                data={GALLERY_IMAGES}
                numColumns={3}
                renderItem={({ item }) => {
                  const isSelected = selectedMedia.find(p => p.id === item.id);
                  return (
                    <TouchableOpacity style={gp.gridItem} onPress={() => toggleMediaSelect(item)}>
                      <Image source={{ uri: item.uri }} style={gp.gridImg} resizeMode="cover" />
                      {isSelected && (
                        <View style={gp.selectedOverlay}>
                          <View style={gp.checkCircle}>
                            <Text style={gp.checkText}>✓</Text>
                          </View>
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

        {/* ───────────────── POST DETAIL ───────────────── */}
        <Modal visible={!!showPostDetail} animationType="slide" transparent>
          <View style={s.overlay}>
            <View style={[s.modal, { maxHeight: '94%' }]}>
              <View style={s.modalHandle} />
              <View style={s.modalHead}>
                <TouchableOpacity onPress={() => setShowPostDetail(null)}>
                  <Text style={s.modalCancel}>← Retour</Text>
                </TouchableOpacity>
                <Text style={s.modalTitle}>Publication</Text>
                <TouchableOpacity onPress={() => Alert.alert('Options', 'Signaler · Partager · Copier le lien')}>
                  <Text style={s.modalCancel}>•••</Text>
                </TouchableOpacity>
              </View>
              {showPostDetail && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={s.detailHead}>
                    <View style={[s.detailAvatarRing, { borderColor: ACCENTS[showPostDetail.author.charCodeAt(3) % ACCENTS.length] + '40' }]}>
                      <View style={[s.detailAvatar, { backgroundColor: ACCENTS[showPostDetail.author.charCodeAt(3) % ACCENTS.length] + '15' }]}>
                        <Text style={[s.detailAvatarText, { color: ACCENTS[showPostDetail.author.charCodeAt(3) % ACCENTS.length] }]}>
                          {showPostDetail.author[1]}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.detailAuthor}>{showPostDetail.author}</Text>
                      <Text style={s.detailMeta}>{showPostDetail.time} · 📍 {showPostDetail.location}</Text>
                    </View>
                    <View style={[s.detailBadge, { backgroundColor: ACCENTS[showPostDetail.author.charCodeAt(3) % ACCENTS.length] + '12' }]}>
                      <Text style={[s.detailBadgeText, { color: ACCENTS[showPostDetail.author.charCodeAt(3) % ACCENTS.length] }]}>
                        {showPostDetail.theme}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.detailBody}>{showPostDetail.text}</Text>
                  {showPostDetail.images?.length > 0 && (
                    <ImageWithTint uri={showPostDetail.images[0]} style={s.detailImg} location={showPostDetail.location} />
                  )}
                  <View style={s.detailDiv} />
                  <View style={s.detailActions}>
                    <LikeButton count={showPostDetail.likes} onPress={() => handleLike(showPostDetail.id)} />
                    <TouchableOpacity style={s.detailAction}>
                      <View style={s.detailActionBg}><Text style={s.detailActionIco}>💬</Text></View>
                      <Text style={s.detailActionCount}>{showPostDetail.comments}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.detailAction}>
                      <View style={s.detailActionBg}><Text style={s.detailActionIco}>↗</Text></View>
                      <Text style={s.detailActionCount}>{showPostDetail.shares}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.commentsSection}>
                    <Text style={s.commentsTitle}>Commentaires</Text>
                    {[
                      { author: '@PaulT', text: 'Super initiative pour Cotonou ! 🇧🇯', likes: 5, time: '2h' },
                      { author: '@KoffiB', text: 'Quand à Parakou ?', likes: 2, time: '1h' },
                      { author: '@MariamB', text: 'Enfin une bonne nouvelle ✨', likes: 8, time: '30min' },
                    ].map((c, i) => (
                      <View key={i} style={s.cc}>
                        <View style={s.ccAvatarWrap}>
                          <View style={[s.ccAvatar, { backgroundColor: ACCENTS[i] + '15' }]}>
                            <Text style={[s.ccAvatarText, { color: ACCENTS[i] }]}>{c.author[1]}</Text>
                          </View>
                        </View>
                        <View style={s.ccBody}>
                          <View style={s.ccHead}>
                            <Text style={s.ccAuthor}>{c.author}</Text>
                            <Text style={s.ccTime}>{c.time}</Text>
                          </View>
                          <Text style={s.ccText}>{c.text}</Text>
                          <View style={s.ccActions}>
                            <Text style={s.ccAction}>♥ {c.likes}</Text>
                            <Text style={s.ccAction}>Répondre</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
              {/* Comment input anchored */}
              {showPostDetail && (
                <View style={s.cf}>
                  <TextInput
                    style={s.cfInput}
                    placeholder="Écrire un commentaire..."
                    placeholderTextColor="rgba(0,0,0,0.25)"
                    value={commentText}
                    onChangeText={setCommentText}
                  />
                  <TouchableOpacity
                    style={[s.cfBtn, !commentText.trim() && { opacity: 0.4 }]}
                    onPress={() => { if (commentText.trim()) { Alert.alert('✓ Commentaire ajouté'); setCommentText(''); } }}
                    disabled={!commentText.trim()}
                  >
                    <Text style={s.cfBtnText}>→</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5DC' },
  container: { flex: 1, backgroundColor: 'transparent' },
  grain: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.015,
  },
  bgOrb1: { position: 'absolute', top: -120, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(245,166,35,0.05)' },
  bgOrb2: { position: 'absolute', top: 350, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(46,134,193,0.03)' },
  bgOrb3: { position: 'absolute', bottom: 200, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(46,134,193,0.04)' },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoAccent: { fontSize: 14, color: '#F5A623' },
  logo: { fontSize: 24, fontWeight: '800', fontStyle: 'italic', color: '#1A1A1A', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.04)', justifyContent: 'center', alignItems: 'center' },
  iconBtnText: { fontSize: 16 },
  hero: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  heroPre: { fontSize: 12, fontWeight: '600', color: '#8A8272', letterSpacing: 1.5, marginBottom: 6 },
  heroTitle: { fontSize: 34, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.8 },
  heroStats: {
    flexDirection: 'row', alignItems: 'center', gap: 0,
    marginTop: 14, backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 16, padding: 16, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroStat: { alignItems: 'center', paddingHorizontal: 12 },
  heroStatDiv: { width: 1, height: 28, backgroundColor: 'rgba(0,0,0,0.06)' },
  heroStatNum: { fontSize: 19, fontWeight: '800', color: '#1A1A1A' },
  heroStatLabel: { fontSize: 11, color: '#B0A89A', fontWeight: '500', marginTop: 2 },
  searchRow: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16, paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  searchIco: { fontSize: 14, marginRight: 10, opacity: 0.35 },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A', outlineStyle: 'none' },
  searchFilterBtn: { padding: 6 },
  searchFilterIco: { fontSize: 18, color: '#B0A89A' },
  filtersWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.72)', marginRight: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  chipOn: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  chipText: { fontSize: 13, color: '#8A8272', fontWeight: '500' },
  chipTextOn: { color: '#FFF' },
  list: { padding: 20, paddingBottom: 120 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  stepsLine: { width: 30, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  fab: {
    position: 'absolute', bottom: 28, right: 20, width: 60, height: 60,
    borderRadius: 30, backgroundColor: '#2E86C1',
    shadowColor: '#2E86C1', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  fabPulse: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(46,134,193,0.2)',
    transform: [{ scale: 1.3 }],
  },
  fabInner: { justifyContent: 'center', alignItems: 'center' },
  fabIco: { fontSize: 30, color: '#FFF', fontWeight: '300', marginTop: -2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#F5F5DC', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '92%', paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'center', marginBottom: 16 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalCancel: { fontSize: 15, color: '#8A8272', fontWeight: '500' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  publishSmall: { backgroundColor: '#2E86C1', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  publishSmallText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 40 },
  emptyGlow: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245,166,35,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyIcon: { fontSize: 36, opacity: 0.3 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#B0A89A', textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 20, backgroundColor: '#1A1A1A', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  detailAvatarRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  detailAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  detailAvatarText: { fontSize: 17, fontWeight: '700' },
  detailAuthor: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  detailMeta: { fontSize: 12, color: '#B0A89A', marginTop: 1 },
  detailBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  detailBadgeText: { fontSize: 12, fontWeight: '600' },
  detailBody: { fontSize: 15, color: '#1A1A1A', lineHeight: 24, marginBottom: 14 },
  detailImg: { width: '100%', height: 250, borderRadius: 16, marginBottom: 16 },
  detailDiv: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginVertical: 16 },
  detailActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  detailAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailActionBg: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center' },
  detailActionIco: { fontSize: 14 },
  detailActionCount: { fontSize: 13, color: '#8A8272', fontWeight: '600' },
  commentsSection: { marginTop: 24 },
  commentsTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  cc: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  ccAvatarWrap: { width: 34, height: 34 },
  ccAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  ccAvatarText: { fontSize: 14, fontWeight: '600' },
  ccBody: { flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 12 },
  ccHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  ccAuthor: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  ccTime: { fontSize: 11, color: '#B0A89A' },
  ccText: { fontSize: 14, color: '#5A5242', lineHeight: 20 },
  ccActions: { flexDirection: 'row', gap: 14, marginTop: 6 },
  ccAction: { fontSize: 12, color: '#8A8272', fontWeight: '500' },
  cf: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8,
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 16, padding: 6,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  cfInput: { flex: 1, fontSize: 14, color: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 8 },
  cfBtn: { backgroundColor: '#2E86C1', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11 },
  cfBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});

const cp = StyleSheet.create({
  previewContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#000' },
  previewPage: { width: width - 48, height: width - 48, position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  counterBadge: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  counterText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  thumbRow: { flexDirection: 'row', padding: 8, gap: 6 },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  addMoreBtn: { width: 40, height: 40, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  addMoreText: { color: '#FFF', fontSize: 20, fontWeight: '300' },
  addMediaBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)', borderStyle: 'dashed',
    padding: 40, alignItems: 'center', marginBottom: 16,
  },
  addMediaIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0EDE0', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  addMediaIcon: { fontSize: 26 },
  addMediaTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  addMediaSub: { fontSize: 13, color: '#B0A89A', marginBottom: 18 },
  browseBtn: { backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  captionRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 16 },
  captionAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0EDE0', justifyContent: 'center', alignItems: 'center' },
  captionAvatarText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  captionInput: { flex: 1, fontSize: 15, color: '#1A1A1A', lineHeight: 22, maxHeight: 100, paddingTop: 6 },
  options: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 4, marginBottom: 16 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  optionLabel: { fontSize: 15, color: '#1A1A1A' },
  optionValue: { flexDirection: 'row', alignItems: 'center' },
  optionValueText: { fontSize: 14, color: '#2E86C1', fontWeight: '500' },
  optionDiv: { height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginHorizontal: 16 },
  themeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', marginLeft: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  themeChipOn: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  themeChipText: { fontSize: 12, color: '#8A8272', fontWeight: '500' },
  themeChipTextOn: { color: '#FFF' },
  bottomPublish: {
    backgroundColor: '#2E86C1', borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    marginTop: 8, shadowColor: '#2E86C1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  bottomPublishText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

const gp = StyleSheet.create({
  stats: { paddingHorizontal: 4, paddingBottom: 12 },
  statsText: { fontSize: 13, color: '#8A8272', fontWeight: '500' },
  gridItem: { width: (width - 48 - 16) / 3, height: (width - 48 - 16) / 3, margin: 2, borderRadius: 8, overflow: 'hidden' },
  gridImg: { width: '100%', height: '100%' },
  selectedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(46,134,193,0.3)', justifyContent: 'center', alignItems: 'center' },
  checkCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#2E86C1', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  checkText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
