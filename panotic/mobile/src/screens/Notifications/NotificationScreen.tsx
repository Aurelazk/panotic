import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { api } from '../../api/client';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Fetch notifications error:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: string, link?: string, type?: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

      if (link) {
        if (type === 'formation') navigation.navigate('Formation', { screen: 'FormationDetail', params: { id: link } });
        else if (type === 'publicite') navigation.navigate('Publicité', { screen: 'CampaignDetail', params: { id: link } });
      }
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'signalement': return { name: 'map-outline', color: '#007AFF' };
      case 'publicite': return { name: 'megaphone-outline', color: COLORS.secondary };
      case 'formation': return { name: 'school-outline', color: '#5856D6' };
      case 'ugc': return { name: 'newspaper-outline', color: '#34C759' };
      default: return { name: 'notifications-outline', color: '#8899AA' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const icon = getIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        onPress={() => handleMarkAsRead(item.id, item.link, item.type)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: icon.color + '15' }]}>
          <Icon name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && styles.titleUnread]}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <LinearGradient colors={['#0A1628', '#001B3D']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markBtn}>
          <Text style={styles.markBtnText}>Tout lu</Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.secondary]} tintColor={COLORS.secondary} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySub}>Vous serez notifié des mises à jour ici.</Text>
          </View>
        }
      />
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
  },
  markBtn: {
    backgroundColor: 'rgba(255,102,0,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  markBtnText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F5F9',
  },
  list: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.18)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2A3A',
    flex: 1,
  },
  titleUnread: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginLeft: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: '#1A2A3A',
  },
  emptySub: {
    color: COLORS.textTertiary,
    fontSize: 13,
    marginTop: 4,
  },
});

export default NotificationScreen;
