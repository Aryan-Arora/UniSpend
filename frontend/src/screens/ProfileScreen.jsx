import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { iconForEmoji } from '../utils/iconMap';
import Svg, { Circle, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import HealthScoreBadge from '../components/HealthScoreBadge';
import SpenderTypeBadge from '../components/SpenderTypeBadge';

const { width } = Dimensions.get('window');

const SettingRow = ({ icon, title, subtitle, onPress, showArrow = true }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress}>
    <View style={styles.settingIcon}>
      <Ionicons name={iconForEmoji(icon)} size={20} color="#36FFC4" />
    </View>
    <View style={styles.settingInfo}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSub}>{subtitle}</Text>}
    </View>
    {showArrow && <Text style={styles.settingArrow}>›</Text>}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const {
    profile,
    riskScore,
    riskLabel,
    segment,
    emergencyFund,
    connectedAccounts,
    loading,
    refreshing,
    onRefresh,
    aiSpenderType,
    aiHealthScore,
    aiLoading,
    aiAvailable,
  } = useProfile();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  const riskColor = riskScore < 40 ? '#36FFC4' : riskScore < 70 ? '#36FFC4' : '#ff6b6b';
  const initials = (profile?.name || '')
    .split(' ')
    .map((n) => n?.[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

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
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={20} color="#E0E3E5" />
          </TouchableOpacity>
        </View>

        {/* Avatar & Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.name || ''}</Text>
          <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberText}>{segment || ''}</Text>
          </View>
        </View>

        {/* AI Financial Intelligence */}
        {!aiLoading && aiAvailable && (
          <View style={styles.aiCard}>
            <Text style={styles.cardTitle}>AI Financial Intelligence</Text>
            <View style={styles.aiRow}>
              <HealthScoreBadge score={aiHealthScore} />
              <SpenderTypeBadge type={aiSpenderType} />
            </View>
          </View>
        )}

        {/* Risk Score Gauge */}
        <View style={styles.riskCard}>
          <Text style={styles.cardTitle}>Risk Score</Text>
          <View style={styles.riskGauge}>
            <Svg width="120" height="120" viewBox="0 0 120 120">
              <G rotation="-90" origin="60, 60">
                {/* Background Circle */}
                <Circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(16, 185, 129, 0.1)"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress Circle */}
                <Circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={riskColor}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - riskScore / 100)}`}
                  strokeLinecap="round"
                />
              </G>
            </Svg>
            <View style={styles.riskCircleInner}>
              <Text style={[styles.riskScoreText, { color: riskColor }]}>{riskScore}</Text>
              <Text style={styles.riskOutOf}>/100</Text>
            </View>
          </View>
          <Text style={[styles.riskLabel, { color: riskColor }]}>{riskLabel}</Text>
          <Text style={styles.riskDesc}>Based on your portfolio and spending patterns</Text>
        </View>

        {/* Emergency Fund */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Text style={styles.cardTitle}>Emergency Fund</Text>
            <Text style={styles.emergencyTarget}>
              {emergencyFund ? `₹${emergencyFund.current.toLocaleString()} / ₹${emergencyFund.target.toLocaleString()}` : '—'}
            </Text>
          </View>
          <View style={styles.emergencyBarBg}>
            <LinearGradient
              colors={['#36FFC4', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.emergencyBarFill, {
                width: `${emergencyFund ? Math.min(emergencyFund.percent, 100) : 0}%`,
              }]}
            />
          </View>
          <Text style={styles.emergencyPct}>
            {emergencyFund ? `${emergencyFund.percent}% of goal reached` : 'No data yet'}
          </Text>
        </View>

        {/* Connected Accounts */}
        <View style={styles.accountsCard}>
          <Text style={styles.cardTitle}>Connected Accounts</Text>
          {connectedAccounts.map((account, idx) => (
            <View key={idx} style={styles.accountRow}>
              <View style={[styles.accountIcon, { backgroundColor: account.color + '22' }]}>
                <Ionicons name={iconForEmoji(account.icon)} size={20} color="#36FFC4" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.type}</Text>
              </View>
              <View style={styles.accountStatus}>
                <View style={[styles.statusDot, { backgroundColor: account.connected ? '#36FFC4' : '#ff6b6b' }]} />
                <Text style={[styles.statusText, { color: account.connected ? '#36FFC4' : '#ff6b6b' }]}>
                  {account.connected ? 'Active' : 'Disconnected'}
                </Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addAccountBtn}>
            <Text style={styles.addAccountIcon}>+</Text>
            <Text style={styles.addAccountText}>Link Another Account</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsGroup}>
          <SettingRow icon="🔔" title="Notifications" subtitle="Alerts & Reminders" />
          <SettingRow icon="🔒" title="Security" subtitle="Password, 2FA" />
          <SettingRow icon="💳" title="Payment Methods" subtitle="Manage cards" />
          <SettingRow icon="🌙" title="Appearance" subtitle="Dark Mode" />
          <SettingRow icon="📊" title="Data & Privacy" subtitle="Export your data" />
          <SettingRow icon="❓" title="Help & Support" subtitle="FAQs & Contact" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#E0E3E5" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Unispend v1.0.0</Text>

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
  editBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E293B',
  },
  editIcon: { fontSize: 16 },
  profileCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#1E293B',
  },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 3, borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  avatarInitials: { color: '#fff', fontSize: 28, fontWeight: '700' },
  profileName: { color: '#E0E3E5', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  profileEmail: { color: '#859399', fontSize: 14, marginBottom: 12 },
  memberBadge: {
    backgroundColor: 'rgba(54, 255, 196, 0.12)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
  },
  memberText: { color: '#36FFC4', fontSize: 13, fontWeight: '600' },
  riskCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#1E293B',
  },
  cardTitle: { color: '#E0E3E5', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  riskGauge: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 12 },
  riskCircleInner: { position: 'absolute', alignItems: 'center' },
  riskScoreText: { fontSize: 32, fontWeight: '700' },
  riskOutOf: { color: '#859399', fontSize: 12 },
  riskLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  riskDesc: { color: '#859399', fontSize: 12, textAlign: 'center' },
  emergencyCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E293B',
  },
  emergencyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  emergencyTarget: { color: '#36FFC4', fontSize: 13, fontWeight: '700' },
  emergencyBarBg: { height: 8, backgroundColor: '#1E293B', borderRadius: 4, marginBottom: 8 },
  emergencyBarFill: { height: 8, borderRadius: 4 },
  emergencyPct: { color: '#859399', fontSize: 12 },
  accountsCard: {
    backgroundColor: '#0F172A', borderRadius: 20, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: '#1E293B',
  },
  accountRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  accountIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  accountEmoji: { fontSize: 18 },
  accountInfo: { flex: 1 },
  accountName: { color: '#E0E3E5', fontSize: 14, fontWeight: '600' },
  accountType: { color: '#859399', fontSize: 12, marginTop: 1 },
  accountStatus: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  addAccountBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, marginTop: 8,
  },
  addAccountIcon: { color: '#10B981', fontSize: 18, marginRight: 8 },
  addAccountText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: '#E0E3E5', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  settingsGroup: {
    backgroundColor: '#0F172A', borderRadius: 20, overflow: 'hidden', marginBottom: 24,
    borderWidth: 1, borderColor: '#1E293B',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#1E293B',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  settingEmoji: { fontSize: 16 },
  settingInfo: { flex: 1 },
  settingTitle: { color: '#E0E3E5', fontSize: 14, fontWeight: '600' },
  settingSub: { color: '#859399', fontSize: 12, marginTop: 1 },
  settingArrow: { color: '#859399', fontSize: 22, fontWeight: '300' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.08)', borderRadius: 16,
    paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.2)', marginBottom: 16,
  },
  logoutIcon: { fontSize: 18, marginRight: 8 },
  logoutText: { color: '#ff6b6b', fontSize: 16, fontWeight: '700' },
  versionText: { color: '#859399', fontSize: 12, textAlign: 'center', marginBottom: 10 },
  aiCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
});

export default ProfileScreen;
