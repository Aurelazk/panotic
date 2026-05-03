import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { api } from '../../api/client';
import PostCard from '../../components/PostCard';
import CreatePostModal from './CreatePostModal';
import CommentsModal from './CommentsModal';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

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
      setLoading(false);
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
    return <ActivityIndicator size="small" color="#003366" style={{ marginVertical: 20 }} />;
  };

  const handleLike = async (id: string) => {
    try {
      await api.post(`/ugc/${id}/like`);
      // Update local state for immediate feedback
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sortContainer}>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
          onPress={() => setSortBy('recent')}
        >
          <Icon name="time-outline" size={16} color={sortBy === 'recent' ? '#fff' : '#666'} />
          <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>Récents</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
          onPress={() => setSortBy('popular')}
        >
          <Icon name="trending-up-outline" size={16} color={sortBy === 'popular' ? '#fff' : '#666'} />
          <Text style={[styles.sortText, sortBy === 'popular' && styles.sortTextActive]}>Populaires</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={THEMES}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedTheme(item.value)}
              style={[
                styles.themeChip,
                selectedTheme === item.value && styles.activeChip
              ]}
            >
              {item.icon && (
                <Icon 
                  name={item.icon} 
                  size={16} 
                  color={selectedTheme === item.value ? '#fff' : '#666'} 
                  style={styles.themeIcon} 
                />
              )}
              <Text style={[
                styles.themeText,
                selectedTheme === item.value && styles.activeThemeText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterContent}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6600']} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="newspaper-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Aucune publication pour le moment.</Text>
            </View>
          ) : null
        }
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={30} color="#fff" />
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
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    color: '#999',
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  sortButtonActive: {
    backgroundColor: '#003366',
  },
  sortText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  sortTextActive: {
    color: '#fff',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  filterContent: {
    paddingHorizontal: 15,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeChip: {
    backgroundColor: '#FF6600',
    borderColor: '#FF6600',
  },
  themeIcon: {
    marginRight: 6,
  },
  themeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeThemeText: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6600',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default SocialScreen;
