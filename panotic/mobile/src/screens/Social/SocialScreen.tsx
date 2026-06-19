import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Text, TouchableOpacity, StatusBar } from 'react-native';
import { api } from '../../api/client';
import PostCard from '../../components/PostCard';
import CreatePostModal from './CreatePostModal';
import CommentsModal from './CommentsModal';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const THEMES = [
  { label: 'Tous', value: '' },
  { label: 'Environnement', value: 'environnement', icon: 'leaf-outline' },
  { label: 'Santé', value: 'sante', icon: 'heart-outline' },
  { label: 'Famille', value: 'famille', icon: 'people-outline' },
];

const SocialScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [sortBy, setSortBy] = useState<'recent'|'popular'>('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const fetchPosts = async (pageNum: number, isRefresh: boolean = false) => {
    try {
      const url = `/ugc?page=${pageNum}&limit=10&sortBy=${sortBy}${selectedTheme ? `&theme=${selectedTheme}` : ''}`;
      const response = await api.get(url);
      const newPosts = response.data.posts;
      
      if (isRefresh) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(pageNum < response.data.lastPage);
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Fetch posts error:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts(1, true);
      setPage(1);
    }, [selectedTheme, sortBy])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="small" color={COLORS.secondary} style={{ marginVertical: 20 }} />;
  };

  const handleLike = async (id: string) => {
    const prevPosts = posts;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
    try {
      await api.post(`/ugc/${id}/like`);
    } catch (error) {
      console.error('Like error:', error);
      setPosts(prevPosts);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fil d'actualité</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.sortPill} onPress={() => setSortBy(sortBy === 'recent' ? 'popular' : 'recent')}>
            <Icon name={sortBy === 'recent' ? 'time-outline' : 'trending-up-outline'} size={14} color="#FFFFFF" />
            <Text style={styles.sortPillText}>{sortBy === 'recent' ? 'Récents' : 'Populaires'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.themeBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={THEMES}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedTheme(item.value)}
              style={[styles.chip, selectedTheme === item.value && styles.chipActive]}
            >
              {item.icon && (
                <Icon name={item.icon} size={15} color={selectedTheme === item.value ? '#fff' : COLORS.textSecondary} style={{ marginRight: 6 }} />
              )}
              <Text style={[styles.chipText, selectedTheme === item.value && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chipList}
        />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={(id) => {
              setSelectedPost(item);
              setCommentsVisible(true);
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.secondary]} tintColor={COLORS.secondary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Icon name="newspaper-outline" size={56} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Aucune publication</Text>
              <Text style={styles.emptySub}>Soyez le premier à partager quelque chose</Text>
            </View>
          ) : null
        }
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPostCreated={() => onRefresh()}
      />

      {selectedPost && (
        <CommentsModal
          visible={commentsVisible}
          postId={selectedPost.id}
          comments={selectedPost.comments || []}
          onClose={() => {
            setCommentsVisible(false);
            setSelectedPost(null);
          }}
          onCommentAdded={() => onRefresh()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A1628',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
  },
  headerRight: {},
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 5,
  },
  sortPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  themeBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
    paddingVertical: 10,
  },
  chipList: {
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4F8',
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: COLORS.secondary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: '#1A2A3A',
    marginTop: 12,
  },
  emptySub: {
    color: COLORS.textTertiary,
    fontSize: 13,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
});

export default SocialScreen;
