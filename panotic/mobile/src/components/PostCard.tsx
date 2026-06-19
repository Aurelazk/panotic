import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PostCardProps {
  post: any;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
}

const THEME_COLORS: any = {
  environnement: '#4CAF50',
  sante: '#F44336',
  famille: '#2196F3',
};

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const themeColor = THEME_COLORS[post.theme] || '#666';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'formateur': return 'FORMATEUR';
      case 'autorite': return 'OFFICIEL';
      case 'regie': return 'RÉGIE';
      default: return null;
    }
  };

  const roleLabel = getRoleLabel(post.author?.role);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <View style={[styles.avatarPlaceholder, roleLabel && styles.verifiedAvatar]}>
            <Text style={styles.avatarText}>{post.author?.email?.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>{post.author?.email?.split('@')[0] || 'Anonyme'}</Text>
              {post.author?.badge && (
                <View style={[styles.roleBadge, { backgroundColor: '#4CAF5020' }]}>
                  <Text style={[styles.roleText, { color: '#4CAF50' }]}>{post.author.badge}</Text>
                </View>
              )}
              {roleLabel && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{roleLabel}</Text>
                </View>
              )}
            </View>
            <Text style={styles.date}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
            </Text>
          </View>
        </View>
        <View style={[styles.themeBadge, { backgroundColor: themeColor + '15' }]}>
          <Text style={[styles.themeText, { color: themeColor }]}>{post.theme?.toUpperCase() || ''}</Text>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.mediaUrl && (
        <Image source={{ uri: post.mediaUrl }} style={styles.media} resizeMode="cover" />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onLike(post.id)}>
          <Icon name="heart-outline" size={22} color="#666" style={styles.actionIcon} />
          <Text style={styles.actionText}>{post.likesCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onComment(post.id)}>
          <Icon name="chatbubble-outline" size={20} color="#666" style={styles.actionIcon} />
          <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share-social-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  verifiedAvatar: {
    borderColor: '#FF6600',
    borderWidth: 2,
  },
  avatarText: {
    color: '#003366',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1A1A1A',
  },
  roleBadge: {
    backgroundColor: '#FF660020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  roleText: {
    color: '#FF6600',
    fontSize: 8,
    fontWeight: '800',
  },
  date: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  themeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  themeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  media: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  shareBtn: {
    marginLeft: 'auto',
  },
});

export default PostCard;
