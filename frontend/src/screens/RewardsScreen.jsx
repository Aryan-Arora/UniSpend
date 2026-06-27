import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { iconForEmoji } from '../utils/iconMap';
import LinearGradient from 'react-native-linear-gradient';
import { useRewards } from '../hooks/useRewards';

const { width } = Dimensions.get('window');

const OfferCard = ({ title, merchant, discount, icon, color, expiresIn }) => (
  <View style={styles.offerCard}>
    <View style={[styles.offerIconWrap, { backgroundColor: (color || '#10B981') + '22' }]}>
      <Text style={styles.offerEmoji}>{icon}</Text>
    </View>
    <Text style={styles.offerMerchant}>{merchant}</Text>
    <Text style={styles.offerTitle}>{title}</Text>
    <View style={styles.offerBadge}>
      <Text style={styles.offerDiscount}>{discount}</Text>
    </View>
    {expiresIn && <Text style={styles.offerExpiry}>Expires in {expiresIn}</Text>}
  </View>
);

const HistoryItem = ({ merchant, date, amount, icon }) => (
  <View style={styles.historyRow}>
    <View style={styles.historyIcon}>
      <Text style={styles.historyEmoji}>{icon}</Text>
    </View>
    <View style={styles.historyInfo}>
      <Text style={styles.historyMerchant}>{merchant}</Text>
      <Text style={styles.historyDate}>{date}</Text>
    </View>
    <Text style={styles.historyAmount}>+₹{amount}</Text>
  </View>
);

const RewardsScreen = () => {
  const {
    totalCashback,
    pendingCashback,
    offers,
    history,
    tier,
    nextTier,
    loading,
    refreshing,
    onRefresh,
    error,
  } = useRewards();

  const renderPersonalizedOffer = ({ item }) => (
    <View style={styles.personalizedCard}>
      <Text style={styles.personalizedIcon}>{item.icon}</Text>
      <Text style={styles.personalizedTitle}>{item.title}</Text>
      <Text style={styles.personalizedDiscount}>{item.discount}</Text>
      <TouchableOpacity style={styles.claimBtn}>
        <Text style={styles.claimText}>Claim</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={['#10B981']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rewards</Text>
          <TouchableOpacity style={styles.historyBtn}>
            <Ionicons name="clipboard-outline" size={20} color="#E0E3E5" />
          </TouchableOpacity>
        </View>

        {/* Cashback Hero */}
        <LinearGradient
          colors={['#0F172A', '#0A1622']}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Total Cashback Earned</Text>
              <Text style={styles.heroAmount}>₹{totalCashback}</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Ionicons name="gift-outline" size={20} color="#E0E3E5" />
            </View>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroBottom}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Pending</Text>
              <Text style={styles.heroStatValue}>₹{pendingCashback}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>This Month</Text>
              <Text style={styles.heroStatValue}>₹{pendingCashback}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Offers Used</Text>
              <Text style={styles.heroStatValue}>{history.length}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tier Progress */}
        <View style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierTitle}>Rewards Tier</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{tier?.name || 'Bronze'}</Text>
            </View>
          </View>
          <View style={styles.tierProgress}>
            <View style={[styles.tierProgressFill, { width: `${nextTier?.threshold ? Math.min(100, ((nextTier.threshold - nextTier.remaining) / nextTier.threshold) * 100) : 0}%` }]} />
          </View>
          <Text style={styles.tierProgressText}>{nextTier?.remaining > 0 ? `₹${nextTier.remaining.toLocaleString()} more to reach ${nextTier.name}` : 'Max tier reached!'}</Text>
        </View>

        {/* Offers Grid */}
        <Text style={styles.sectionTitle}>Available Offers</Text>
        <View style={styles.offersGrid}>
          {offers.map((offer, idx) => (
            <OfferCard key={idx} {...offer} />
          ))}
        </View>



        {/* Earned History */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Recent Cashback</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {history.map((item, idx) => (
          <HistoryItem key={idx} {...item} />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 54 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  headerTitle: { color: '#E0E3E5', fontSize: 24, fontWeight: '700' },
  historyBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E293B',
  },
  historyBtnIcon: { fontSize: 18 },
  heroCard: {
    borderRadius: 20, padding: 24, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(54, 255, 196, 0.2)',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: '#36FFC4', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  heroAmount: { color: '#36FFC4', fontSize: 36, fontWeight: '700' },
  heroIconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(54, 255, 196, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroIcon: { fontSize: 28 },
  heroDivider: { height: 1, backgroundColor: '#1E293B', marginVertical: 18 },
  heroBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  heroStat: { alignItems: 'center' },
  heroStatLabel: { color: '#859399', fontSize: 11, marginBottom: 4 },
  heroStatValue: { color: '#E0E3E5', fontSize: 16, fontWeight: '700' },
  tierCard: {
    backgroundColor: '#0F172A', borderRadius: 16, padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: '#1E293B',
  },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tierTitle: { color: '#E0E3E5', fontSize: 15, fontWeight: '600' },
  tierBadge: {
    backgroundColor: 'rgba(54, 255, 196, 0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  tierBadgeText: { color: '#36FFC4', fontSize: 12, fontWeight: '700' },
  tierProgress: { height: 6, backgroundColor: '#1E293B', borderRadius: 3, marginBottom: 8 },
  tierProgressFill: { width: '65%', height: 6, backgroundColor: '#36FFC4', borderRadius: 3 },
  tierProgressText: { color: '#859399', fontSize: 12 },
  sectionTitle: { color: '#E0E3E5', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  offersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  offerCard: {
    width: (width - 50) / 2, backgroundColor: '#0F172A', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#1E293B',
  },
  offerIconWrap: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  offerEmoji: { fontSize: 22 },
  offerMerchant: { color: '#859399', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  offerTitle: { color: '#E0E3E5', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  offerBadge: {
    backgroundColor: 'rgba(54, 255, 196, 0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
  },
  offerDiscount: { color: '#36FFC4', fontSize: 13, fontWeight: '700' },
  offerExpiry: { color: '#859399', fontSize: 10, marginTop: 6 },
  personalizedHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  personalizedList: { paddingBottom: 20, gap: 10 },
  personalizedCard: {
    width: 160, backgroundColor: '#0F172A', borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  personalizedIcon: { fontSize: 28, marginBottom: 8 },
  personalizedTitle: { color: '#E0E3E5', fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
  personalizedDiscount: { color: '#10B981', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  claimBtn: {
    backgroundColor: '#10B981', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 8,
  },
  claimText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  viewAll: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A',
    borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1E293B',
  },
  historyIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(54, 255, 196, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  historyEmoji: { fontSize: 18 },
  historyInfo: { flex: 1 },
  historyMerchant: { color: '#E0E3E5', fontSize: 14, fontWeight: '600' },
  historyDate: { color: '#859399', fontSize: 11, marginTop: 2 },
  historyAmount: { color: '#36FFC4', fontSize: 15, fontWeight: '700' },
});

export default RewardsScreen;
