import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../constants/colors';
import { SIGNALEMENT_TYPES, PANEL_STATUSES } from '../constants/mapData';
import { styles } from '../styles/CarteInteractive.styles';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function getSignalementColor(type) {
  const found = SIGNALEMENT_TYPES.find(t => t.value === type);
  return found ? found.color : COLORS.primary;
}

function getPanelColor(etat) {
  const found = PANEL_STATUSES.find(s => s.value === etat);
  return found ? found.color : COLORS.primary;
}

function SignalementDetail({ item }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Signalement</Text>
      <View style={[styles.calloutHeader, { backgroundColor: getSignalementColor(item.type), borderRadius: 10, marginBottom: 15 }]}>
        <Text style={styles.calloutTitle}>{item.type?.replace('_', ' ')}</Text>
      </View>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.modalImage} />}
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Description:</Text><Text style={styles.infoValue}>{item.description}</Text></View>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Statut:</Text><Text style={styles.infoValue}>{item.status}</Text></View>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Votes:</Text><Text style={styles.infoValue}>{item.votesCount}</Text></View>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Date:</Text><Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text></View>
    </ScrollView>
  );
}

function PanneauDetail({ item }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Détails du Panneau</Text>
      <View style={[styles.calloutHeader, { backgroundColor: getPanelColor(item.etat), borderRadius: 10, marginBottom: 15 }]}>
        <Text style={styles.calloutTitle}>{item.type}</Text>
      </View>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.modalImage} />}
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Format:</Text><Text style={styles.infoValue}>{item.format}</Text></View>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Régime:</Text><Text style={styles.infoValue}>{item.regime}</Text></View>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>État:</Text><Text style={styles.infoValue}>{item.etat}</Text></View>
      {item.price && <View style={styles.infoRow}><Text style={styles.infoLabel}>Prix:</Text><Text style={styles.infoValue}>{item.price.toLocaleString()} FCFA</Text></View>}
    </ScrollView>
  );
}

function ZoneDetail({ item }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Zone</Text>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Nom:</Text><Text style={styles.infoValue}>{item.name}</Text></View>
      <View style={styles.infoRow}><Text style={styles.infoLabel}>Type:</Text><Text style={styles.infoValue}>{item.type}</Text></View>
    </ScrollView>
  );
}

export default function DetailModal({ item, onClose }) {
  return (
    <Modal visible={!!item} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {item?.type === 'signalement' && <SignalementDetail item={item} />}
          {item?.type === 'panneau' && <PanneauDetail item={item} />}
          {item?.type === 'zone' && <ZoneDetail item={item} />}
        </View>
      </View>
    </Modal>
  );
}
