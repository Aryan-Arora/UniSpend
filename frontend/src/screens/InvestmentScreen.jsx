import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { iconForEmoji } from '../utils/iconMap';
import LinearGradient from 'react-native-linear-gradient';
import { useInvestment } from '../hooks/useInvestment';
import AIPortfolioCard from '../components/AIPortfolioCard';

const { width } = Dimensions.get('window');

const HoldingItem = ({ symbol, name, price, change, icon }) => (
  <View style={styles.holdingRow}>
    <View style={styles.holdingIcon}>
      <Ionicons name={iconForEmoji(icon || '📊')} size={20} color="#36FFC4" />
    </View>
    <View style={styles.holdingInfo}>
      <Text style={styles.holdingSymbol}>{symbol}</Text>
      <Text style={styles.holdingName}>{name}</Text>
    </View>
    <View style={styles.holdingRight}>
      <Text style={styles.holdingPrice}>₹{price}</Text>
      <Text style={[styles.holdingChange, { color: change >= 0 ? '#36FFC4' : '#ff6b6b' }]}>
        {change >= 0 ? '+' : ''}{change}%
      </Text>
    </View>
  </View>
);

const MarketMover = ({ symbol, price, change, icon }) => (
  <View style={styles.moverCard}>
    <Text style={styles.moverIcon}>{icon}</Text>
    <Text style={styles.moverSymbol}>{symbol}</Text>
    <Text style={styles.moverPrice}>₹{price}</Text>
    <Text style={[styles.moverChange, { color: change >= 0 ? '#36FFC4' : '#ff6b6b' }]}>
      {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
    </Text>
  </View>
);

const InvestmentScreen = () => {
  const {
    account,
    holdings,
    movers,
    orders,
    allocation,
    riskProfile,
    accountLoading,
    holdingsLoading,
    moversLoading,
    orderLoading,
    error,
    placeOrder,
    refresh,
    aiPortfolio,
    aiPortfolioLoading,
    investmentAdvice,
    aiAvailable,
  } = useInvestment();

  const riskScore = riskProfile?.risk_score || 0;
  const riskLabel = riskProfile?.label || 'Moderate';

  const [orderSymbol, setOrderSymbol] = useState('');
  const [orderQty, setOrderQty] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handleInvest = async () => {
    if (!orderSymbol || !orderQty) {
      Alert.alert('Error', 'Please enter symbol and quantity');
      return;
    }
    try {
      const parsedQty = parseFloat(orderQty);
      if (isNaN(parsedQty) || parsedQty <= 0) {
        Alert.alert('Error', 'Please enter a valid quantity');
        return;
      }

      const result = await placeOrder(orderSymbol, parsedQty, 'buy');
      if (result.success) {
        Alert.alert('Success', `Order placed for ${orderQty} units of ${orderSymbol}`);
        setShowOrderModal(false);
        setOrderSymbol('');
        setOrderQty('');
      } else {
        const errorMsg = result.error;
        if (errorMsg.includes('symbol not found')) {
          Alert.alert('Invalid Symbol', `${orderSymbol} not found. Note: Alpaca Paper trading supports US stocks only (e.g. AAPL, BTC).`);
        } else {
          Alert.alert('Order Failed', errorMsg || 'Failed to place order');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const riskColor = riskScore < 40 ? '#36FFC4' : riskScore < 70 ? '#36FFC4' : '#ff6b6b';

  const renderMover = ({ item }) => <MarketMover {...item} />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh} tintColor="#10B981" colors={['#10B981']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
            <View>
              <Text style={styles.welcomeSmall}>Welcome back,</Text>
              <Text style={styles.userName}>Portfolio</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="search-outline" size={20} color="#E0E3E5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="notifications-outline" size={20} color="#E0E3E5" />
            </TouchableOpacity>
          </View>
        </View>

        {movers?.gainers?.[0] && (
        <View style={styles.tickerRow}>
          <Text style={styles.tickerLabel}>{movers.gainers[0]?.symbol || ''}</Text>
          <Text style={styles.tickerValueGreen}> {movers.gainers[0]?.price || ''} ({movers.gainers[0]?.changePercent || ''})</Text>
          {movers.gainers[1] && <><Text style={styles.tickerLabel}>  {movers.gainers[1]?.symbol || ''}</Text>
          <Text style={styles.tickerValueGreen}> {movers.gainers[1]?.price || ''} ({movers.gainers[1]?.changePercent || ''})</Text></>}
        </View>
        )}

        {/* Portfolio Value */}
        <LinearGradient
          colors={['#0F2A24', '#0A1622']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.portfolioCard}
        >
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>{account ? `₹${account.portfolioValue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}` : '—'}</Text>
          <View style={styles.returnsRow}>
            <Ionicons name={iconForEmoji(account?.dayPnl >= 0 ? '📈' : '📉')} size={20} color="#36FFC4" />
            <Text style={[styles.returnsText, { color: (account?.dayPnl || 0) >= 0 ? '#36FFC4' : '#ff6b6b' }]}>
              {account ? `${account.dayPnl >= 0 ? '+' : ''}₹${Math.abs(account.dayPnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            </Text>
          </View>
          <Text style={styles.returnsLabel}>TODAY'S RETURNS</Text>
        </LinearGradient>

        {/* Portfolio Breakdown */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Cash</Text>
              <Text style={styles.breakdownValue}>
                {account ? `₹${(account.cash || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Invested</Text>
              <Text style={styles.breakdownValue}>
                {account ? `₹${((account.portfolioValue || 0) - (account.cash || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </Text>
            </View>
          </View>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Buying Power</Text>
              <Text style={styles.breakdownValue}>
                {account ? `₹${(account.buyingPower || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Total P&L</Text>
              <Text style={[styles.breakdownValue, { color: (account?.totalPnl || 0) >= 0 ? '#36FFC4' : '#ff6b6b' }]}>
                {account ? `${(account.totalPnl || 0) >= 0 ? '+' : ''}₹${Math.abs(account.totalPnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Portfolio Recommendation */}
        {aiAvailable && aiPortfolio && aiPortfolio.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <AIPortfolioCard portfolio={aiPortfolio} advice={investmentAdvice} />
          </View>
        )}

        {/* Invest Button */}
        <TouchableOpacity style={styles.investButton} onPress={() => setShowOrderModal(!showOrderModal)}>
          <LinearGradient
            colors={['#10B981', '#36FFC4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.investGradient}
          >
            <Ionicons name="cash-outline" size={20} color="#E0E3E5" />
            <Text style={styles.investText}>Invest Today's Savings</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Order */}
        {showOrderModal && (
          <View style={styles.orderCard}>
            <Text style={styles.orderTitle}>Quick Invest</Text>
            <TextInput
              style={styles.orderInput}
              placeholder="Symbol (e.g. RELIANCE)"
              placeholderTextColor="#5A6572"
              value={orderSymbol}
              onChangeText={setOrderSymbol}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.orderInput}
              placeholder="Quantity"
              placeholderTextColor="#5A6572"
              value={orderQty}
              onChangeText={setOrderQty}
              keyboardType="numeric"
            />
            <TouchableOpacity 
              style={[styles.orderSubmit, { opacity: orderLoading ? 0.6 : 1 }]} 
              onPress={handleInvest}
              disabled={orderLoading}
            >
              <Text style={styles.orderSubmitText}>
                {orderLoading ? 'Processing...' : 'Place Buy Order'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Risk Profile */}
        <View style={styles.riskCard}>
          <Text style={styles.riskTitle}>RISK PROFILE</Text>
          {/* Linear gauge bar */}
          <View style={styles.gaugeBarContainer}>
            <View style={styles.gaugeBarTrack}>
              <LinearGradient
                colors={['#36FFC4', '#36FFC4', '#ff6b6b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gaugeBarFill, { width: `${Math.max(riskScore, 5)}%` }]}
              />
            </View>
            <View style={[styles.gaugeBarIndicator, { left: `${Math.max(riskScore, 5)}%` }]}>
              <View style={[styles.gaugeBarDot, { backgroundColor: riskColor }]} />
            </View>
          </View>
          <View style={styles.gaugeLabelsRow}>
            <Text style={styles.gaugeLabelMin}>0</Text>
            <Text style={[styles.gaugeScore, { color: riskColor }]}>{riskScore}</Text>
            <Text style={styles.gaugeLabelMax}>100</Text>
          </View>
          <Text style={[styles.riskLabelText, { color: riskColor }]}>{riskLabel}</Text>
          <Text style={styles.riskDescription}>{riskLabel ? `Your risk profile is ${riskLabel}` : ''}</Text>
        </View>


        {/* Market Movers */}
        <Text style={styles.sectionTitle}>Market Movers</Text>
        <FlatList
          data={movers?.gainers ? [...(movers.gainers || []), ...(movers.losers || [])] : []}
          renderItem={renderMover}
          keyExtractor={(item) => item.symbol}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moversList}
        />

        {/* Top Holdings */}
        <View style={styles.holdingsHeader}>
          <Text style={styles.sectionTitle}>Top Holdings</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {holdings.map((holding, idx) => (
          <HoldingItem key={idx} {...holding} />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 54 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  welcomeSmall: { color: '#859399', fontSize: 12 },
  userName: { color: '#E0E3E5', fontSize: 16, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E293B',
  },
  headerBtnIcon: { fontSize: 16 },
  tickerRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 18, paddingVertical: 6,
  },
  tickerLabel: { color: '#859399', fontSize: 11, fontWeight: '600' },
  tickerValueGreen: { color: '#36FFC4', fontSize: 11, fontWeight: '700' },
  portfolioCard: {
    borderRadius: 20, padding: 24, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(54, 255, 196, 0.15)',
  },
  portfolioLabel: { color: '#36FFC4', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  portfolioValue: { color: '#E0E3E5', fontSize: 36, fontWeight: '700' },
  portfolioDecimal: { fontSize: 22, color: '#859399' },
  returnsRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(54, 255, 196, 0.1)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12, alignSelf: 'flex-start',
  },
  returnsIcon: { fontSize: 14, marginRight: 6 },
  returnsText: { color: '#36FFC4', fontSize: 14, fontWeight: '700' },
  returnsLabel: { color: '#859399', fontSize: 10, fontWeight: '600', letterSpacing: 1, marginTop: 6 },
  investButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  investGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16,
  },
  investIcon: { fontSize: 18, marginRight: 8 },
  investText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  orderCard: {
    backgroundColor: '#0F172A', borderRadius: 16, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  orderTitle: { color: '#E0E3E5', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  orderInput: {
    backgroundColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: '#E0E3E5', fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B',
  },
  orderSubmit: {
    backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  orderSubmitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  riskCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 24, marginBottom: 20,
    alignItems: 'center', borderWidth: 1, borderColor: '#1E293B',
  },
  riskTitle: { color: '#859399', fontSize: 12, fontWeight: '600', letterSpacing: 1.5, marginBottom: 20 },
  gaugeBarContainer: {
    width: '100%', height: 28, position: 'relative', marginBottom: 8,
  },
  gaugeBarTrack: {
    width: '100%', height: 12, borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)', overflow: 'hidden',
    marginTop: 8,
  },
  gaugeBarFill: {
    height: '100%', borderRadius: 6,
  },
  gaugeBarIndicator: {
    position: 'absolute', top: 0, marginLeft: -10,
  },
  gaugeBarDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 3, borderColor: '#060B14',
    elevation: 4,
  },
  gaugeLabelsRow: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  gaugeLabelMin: { color: '#36FFC4', fontSize: 11, fontWeight: '600' },
  gaugeLabelMax: { color: '#ff6b6b', fontSize: 11, fontWeight: '600' },
  gaugeScore: { fontSize: 36, fontWeight: '700' },
  riskLabelText: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  riskDescription: { color: '#859399', fontSize: 13, textAlign: 'center' },
  breakdownCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#1E293B',
  },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  breakdownItem: {
    flex: 1, alignItems: 'center',
  },
  breakdownDivider: {
    width: 1, height: 30, backgroundColor: '#1E293B',
  },
  breakdownLabel: {
    color: '#859399', fontSize: 11, fontWeight: '600', marginBottom: 4,
  },
  breakdownValue: {
    color: '#E0E3E5', fontSize: 16, fontWeight: '700',
  },
  sectionTitle: { color: '#E0E3E5', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  moversList: { paddingBottom: 20, gap: 10 },
  moverCard: {
    backgroundColor: '#0F172A', borderRadius: 14, padding: 14, width: 120, alignItems: 'center',
    borderWidth: 1, borderColor: '#1E293B',
  },
  moverIcon: { fontSize: 22, marginBottom: 6 },
  moverSymbol: { color: '#E0E3E5', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  moverPrice: { color: '#859399', fontSize: 12, marginBottom: 4 },
  moverChange: { fontSize: 12, fontWeight: '700' },
  holdingsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  viewAll: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  holdingRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16,
    padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#1E293B',
  },
  holdingIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#1E293B',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  holdingEmoji: { fontSize: 20 },
  holdingInfo: { flex: 1 },
  holdingSymbol: { color: '#E0E3E5', fontSize: 15, fontWeight: '700' },
  holdingName: { color: '#859399', fontSize: 12, marginTop: 2 },
  holdingRight: { alignItems: 'flex-end' },
  holdingPrice: { color: '#E0E3E5', fontSize: 15, fontWeight: '700' },
  holdingChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});

export default InvestmentScreen;
