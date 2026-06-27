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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { iconForEmoji } from '../utils/iconMap';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useSpending } from '../hooks/useSpending';

const { width } = Dimensions.get('window');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SpendingScreen = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    totalSpent,
    dailyData,
    categoryBreakdown,
    topMerchants,
    suggestions,
    heatmapData,
    monthComparison,
    loading,
    refreshing,
    onRefresh,
    topSpendingCategory,
    aiSpendingTrend,
    aiLoading,
    aiAvailable,
  } = useSpending();

  const maxDaily = Math.max(...dailyData.map((d) => d.amount), 1);

  const renderMonthPill = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.monthPill, selectedMonth === index && styles.monthPillActive]}
      onPress={() => setSelectedMonth(index)}
    >
      <Text style={[styles.monthText, selectedMonth === index && styles.monthTextActive]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderSuggestion = ({ item }) => (
    <View style={styles.suggestionCard}>
      <Ionicons name={iconForEmoji(item.icon || '🤖')} size={20} color="#36FFC4" />
      <Text style={styles.suggestionTitle}>{item.title || item.text}</Text>
      {item.message ? <Text style={styles.suggestionMsg}>{item.message}</Text> : null}
      {item.savings ? (
        <View style={styles.suggestionSavings}>
          <Text style={styles.suggestionSavingsText}>Save ₹{item.savings}</Text>
        </View>
      ) : null}
    </View>
  );

  const donutSegments = categoryBreakdown.map((cat, idx) => {
    const total = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0) || 1;
    const pct = (cat.amount / total) * 100;
    return { ...cat, percentage: pct };
  });

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
          <Text style={styles.headerTitle}>Spending Manager</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="settings-outline" size={20} color="#E0E3E5" />
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <FlatList
          data={MONTHS}
          renderItem={renderMonthPill}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthList}
        />

        {/* Total Spent Card */}
        <LinearGradient
          colors={['#0F2A24', '#0A1622']}
          style={styles.totalCard}
        >
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>₹{totalSpent}</Text>
          <View style={styles.totalTrend}>
            <Text style={styles.totalTrendText}>{monthComparison ? `${monthComparison.direction === 'up' ? '+' : '-'}${monthComparison.change}% vs last month` : ''}</Text>
          </View>
        </LinearGradient>

        {/* Category Donut */}
        <View style={styles.donutCard}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.donutContainer}>
            <View style={styles.donutVisual}>
              {/* SVG Donut Chart */}
              {(() => {
                const size = 130;
                const strokeWidth = 14;
                const radius = (size - strokeWidth) / 2;
                const circumference = 2 * Math.PI * radius;
                let cumulativeOffset = 0;

                return (
                  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background ring */}
                    <Circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="#1E293B"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    {/* Category segments */}
                    {donutSegments.map((seg, idx) => {
                      const segmentLength = (seg.percentage / 100) * circumference;
                      const gapSize = donutSegments.length > 1 ? 3 : 0;
                      const dashLength = Math.max(segmentLength - gapSize, 1);
                      const offset = circumference * 0.25 - cumulativeOffset;
                      cumulativeOffset += segmentLength;

                      return (
                        <Circle
                          key={idx}
                          cx={size / 2}
                          cy={size / 2}
                          r={radius}
                          stroke={seg.color}
                          strokeWidth={strokeWidth}
                          fill="none"
                          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </Svg>
                );
              })()}
              {/* Center label */}
              <View style={styles.donutCenterLabel}>
                <Text style={styles.donutTotal}>₹{totalSpent}</Text>
                <Text style={styles.donutSubtext}>Total</Text>
              </View>
            </View>
            <View style={styles.donutLegend}>
              {donutSegments.map((seg, idx) => (
                <View key={idx} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                  <View style={styles.legendTextWrap}>
                    <Text style={styles.legendName}>{seg.name}</Text>
                    <Text style={styles.legendAmount}>₹{seg.amount}</Text>
                  </View>
                  <Text style={styles.legendPct}>{seg.percentage.toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Daily Spending Bar Chart */}
        <View style={styles.dailyCard}>
          <Text style={styles.sectionTitle}>Daily Spending</Text>
          <View style={styles.barChart}>
            {dailyData.slice(0, 7).map((day, idx) => (
              <View key={idx} style={styles.barCol}>
                <View style={styles.barWrap}>
                  <LinearGradient
                    colors={day.isHigh ? ['#ff6b6b', '#ff8e8e'] : ['#10B981', '#36FFC4']}
                    style={[styles.bar, { height: `${(day.amount / maxDaily) * 100}%` }]}
                  />
                </View>
                <Text style={styles.barLabel}>{day.day}</Text>
                <Text style={styles.barAmount}>₹{day.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spending Heatmap */}
        <View style={styles.heatmapCard}>
          <Text style={styles.sectionTitle}>Spending Heatmap</Text>
          <Text style={styles.heatmapSub}>Darker = more spending</Text>
          {/* Day-of-week headers */}
          <View style={styles.heatmapDayHeaders}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <Text key={i} style={styles.heatmapDayLabel}>{d}</Text>
            ))}
          </View>
          <View style={styles.heatmapGrid}>
            {heatmapData.map((cell, idx) => {
              const val = cell?.value ?? cell ?? 0;
              const day = cell?.day ?? idx + 1;
              // More prominent purple palette
              const bg =
                val === 0
                  ? '#0B1220'
                  : val < 0.2
                  ? '#0A3A2E'
                  : val < 0.4
                  ? '#0B6E54'
                  : val < 0.6
                  ? '#0E9E78'
                  : val < 0.8
                  ? '#10B981'
                  : '#36FFC4';
              return (
                <View
                  key={idx}
                  style={[styles.heatCell, { backgroundColor: bg }]}
                >
                  <Text style={styles.heatCellText}>{day}</Text>
                </View>
              );
            })}
          </View>
          {/* Legend */}
          <View style={styles.heatmapLegend}>
            <Text style={styles.heatmapLegendLabel}>Less</Text>
            {['#0B1220', '#0A3A2E', '#0B6E54', '#0E9E78', '#10B981', '#36FFC4'].map((c, i) => (
              <View key={i} style={[styles.heatmapLegendBox, { backgroundColor: c }]} />
            ))}
            <Text style={styles.heatmapLegendLabel}>More</Text>
          </View>
        </View>

        {/* AI Suggestions */}
        <View style={styles.suggestionsHeader}>
          <Ionicons name="sparkles" size={20} color="#E0E3E5" />
          <Text style={styles.sectionTitle}>AI Suggestions</Text>
        </View>
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item, idx) => `sug-${idx}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsList}
          scrollEnabled
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 54 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18,
  },
  headerTitle: { color: '#E0E3E5', fontSize: 24, fontWeight: '700' },
  filterBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E293B',
  },
  filterIcon: { fontSize: 18 },
  monthList: { paddingBottom: 16, gap: 8 },
  monthPill: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B',
  },
  monthPillActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  monthText: { color: '#859399', fontSize: 13, fontWeight: '600' },
  monthTextActive: { color: '#fff' },
  totalCard: {
    borderRadius: 20, padding: 24, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  totalLabel: { color: '#859399', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  totalAmount: { color: '#E0E3E5', fontSize: 36, fontWeight: '700' },
  totalTrend: { marginTop: 8 },
  totalTrendText: { color: '#36FFC4', fontSize: 13, fontWeight: '500' },
  donutCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#1E293B',
  },
  sectionTitle: { color: '#E0E3E5', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  donutContainer: { flexDirection: 'row', alignItems: 'center' },
  donutVisual: {
    width: 130, height: 130, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  donutCenterLabel: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center',
  },
  donutTotal: { color: '#E0E3E5', fontSize: 15, fontWeight: '700' },
  donutSubtext: { color: '#859399', fontSize: 10, marginTop: 2 },
  donutLegend: { flex: 1, marginLeft: 20, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendTextWrap: { flex: 1 },
  legendName: { color: '#E0E3E5', fontSize: 13, fontWeight: '600' },
  legendAmount: { color: '#859399', fontSize: 11, marginTop: 1 },
  legendPct: { color: '#E0E3E5', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  dailyCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#1E293B',
  },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  barCol: { alignItems: 'center', flex: 1 },
  barWrap: { width: 18, height: 110, justifyContent: 'flex-end' },
  bar: { width: 18, borderRadius: 9, minHeight: 6 },
  barLabel: { color: '#859399', fontSize: 10, fontWeight: '600', marginTop: 6 },
  barAmount: { color: '#859399', fontSize: 8, marginTop: 2 },
  heatmapCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  heatmapSub: { color: '#859399', fontSize: 12, marginTop: -10, marginBottom: 14 },
  heatmapDayHeaders: {
    flexDirection: 'row', marginBottom: 6, paddingHorizontal: 2,
  },
  heatmapDayLabel: {
    width: (width - 100) / 7, textAlign: 'center',
    color: '#859399', fontSize: 11, fontWeight: '600',
  },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  heatCell: {
    width: (width - 110) / 7, height: 38, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  heatCellText: {
    color: '#ffffff', fontSize: 12, fontWeight: '700',
  },
  heatmapLegend: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 14, gap: 4,
  },
  heatmapLegendBox: { width: 18, height: 10, borderRadius: 3 },
  heatmapLegendLabel: { color: '#859399', fontSize: 10, fontWeight: '500', marginHorizontal: 4 },
  suggestionsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  suggestionsIcon: { fontSize: 18 },
  suggestionsList: { paddingBottom: 8, gap: 12 },
  suggestionCard: {
    width: 200, backgroundColor: '#0F172A', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#1E293B',
  },
  suggestionIcon: { fontSize: 24, marginBottom: 10 },
  suggestionTitle: { color: '#E0E3E5', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  suggestionMsg: { color: '#859399', fontSize: 12, lineHeight: 17, marginBottom: 12 },
  suggestionSavings: {
    backgroundColor: 'rgba(54, 255, 196, 0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
  },
  suggestionSavingsText: { color: '#36FFC4', fontSize: 12, fontWeight: '700' },
});

export default SpendingScreen;
