import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { open, create } from 'react-native-plaid-link-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { plaidAPI } from '../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { iconForEmoji } from '../utils/iconMap';


const POPULAR_BANKS = [
  { id: 'chase', name: 'Chase', icon: '🏦', color: '#859399' },
  { id: 'boa', name: 'Bank of America', icon: '🔴', color: '#859399' },
  { id: 'wells', name: 'Wells Fargo', icon: '🟠', color: '#859399' },
];

const ConnectBankScreen = ({ navigation }) => {
  const { setHasConnectedBank, setSkippedBank, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [linkToken, setLinkToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  React.useEffect(() => {
    if (linkToken) {
      create({
        token: linkToken,
        onLoad: () => {
          open({
            onSuccess: handlePlaidSuccess,
            onExit: handlePlaidExit,
          });
        }
      });
      setLinkToken(null);
    }
  }, [linkToken, handlePlaidSuccess, handlePlaidExit]);

  const handleConnectBank = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await plaidAPI.createLinkToken();
      const token = response.data?.linkToken || response.data?.link_token;
      if (token) {
        setLinkToken(token);
      } else {
        setErrorMessage('Something went wrong, try again');
      }
    } catch (err) {
      if (!err.response) {
        setErrorMessage('Check your connection');
      } else {
        setErrorMessage('Something went wrong, try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [isLinked, setIsLinked] = useState(false);

  const handlePlaidSuccess = useCallback(
    async (success) => {
      setIsExchanging(true);
      setErrorMessage(null);
      try {
        await plaidAPI.exchangeToken(success.publicToken);
        await AsyncStorage.setItem('bankSetupCompleted', 'true');
        setIsLinked(true);
        setIsExchanging(false);
        setHasConnectedBank(true);
        // AppNavigator will automatically switch to MainTabs
      } catch (err) {
        setIsExchanging(false);
        if (!err.response) {
          setErrorMessage('Check your connection');
        } else {
          setErrorMessage('Something went wrong, try again');
        }
      }
    },
    [setHasConnectedBank]
  );

  const handlePlaidExit = useCallback(
    (exit) => {
      setLinkToken(null);
      if (exit.error) {
        setErrorMessage('Bank connection cancelled. Please try again.');
      }
    },
    []
  );

  const handleSkip = async () => {
    await AsyncStorage.setItem('bankSetupCompleted', 'true');
    setHasConnectedBank(true);
    // AppNavigator will automatically switch to MainTabs
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060B14" />

      {/* Full-screen loading overlay for token exchange */}
      <Modal visible={isExchanging} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Connecting your account...</Text>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                // ConnectBank is the root screen — go back to Auth
                logout();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#E0E3E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Unispend</Text>
          <View style={{ width: 24 }} />
        </View>

        {isLinked ? (
          <View style={styles.successContainer}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={50} color="#04140E" />
            </View>
            <Text style={styles.successTitle}>Bank Connected!</Text>
            <Text style={styles.successSubtitle}>
              Your account is successfully linked. We're redirecting you to your dashboard.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.shieldContainer}>
                <View style={styles.shieldOuter}>
                  <View style={styles.shieldInner}>
                    <Ionicons name="shield-checkmark" size={36} color="#04140E" />
                  </View>
                </View>
              </View>
              <View style={styles.securityBadges}>
                <View style={styles.secBadge}>
                  <Ionicons name="business-outline" size={18} color="#859399" />
                </View>
                <View style={[styles.secBadge, styles.secBadgeActive]}>
                  <Ionicons name="link-outline" size={18} color="#36FFC4" />
                </View>
                <View style={styles.secBadge}>
                  <Ionicons name="document-text-outline" size={18} color="#859399" />
                </View>
              </View>
            </View>

            <Text style={styles.title}>Connect your bank</Text>
            <View style={styles.securedRow}>
              <Ionicons name="checkmark-circle" size={15} color="#36FFC4" style={styles.securedIcon} />
              <Text style={styles.securedText}>Secured by Plaid</Text>
            </View>
          </>
        )}

        {/* Error card */}
        {errorMessage && (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={18} color="#ff6b6b" style={styles.errorIcon} />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => setErrorMessage(null)}>
              <Ionicons name="close" size={18} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        )}

        {!isLinked && (
          <>
            <Text style={styles.sectionLabel}>POPULAR BANKS</Text>

            {POPULAR_BANKS.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[
                  styles.bankRow,
                  selectedBank === bank.id && styles.bankRowSelected,
                ]}
                onPress={() => setSelectedBank(bank.id)}
              >
                <View style={[styles.bankIcon, { backgroundColor: bank.color + '22' }]}>
                  <Ionicons name={iconForEmoji(bank.icon)} size={20} color="#E0E3E5" />
                </View>
                <Text style={styles.bankName}>{bank.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#859399" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.searchLink} onPress={handleConnectBank}>
              <Text style={styles.searchLinkText}>Search for your bank</Text>
            </TouchableOpacity>

            <View style={styles.trustBadges}>
              <View style={styles.trustItem}>
                <Ionicons name="lock-closed-outline" size={22} color="#859399" style={styles.trustIcon} />
                <Text style={styles.trustLabel}>256-BIT{'\n'}ENCRYPTION</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#859399" style={styles.trustIcon} />
                <Text style={styles.trustLabel}>BANK-LEVEL{'\n'}SECURITY</Text>
              </View>
            </View>
          </>
        )}

        {!isLinked && (
          <>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectBank}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#10B981', '#36FFC4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.connectGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#04140E" />
                ) : (
                  <Text style={styles.connectText}>Connect Bank Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              By connecting your account, you agree to our Terms of Service and Privacy Policy. Your credentials are never stored.
            </Text>

            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060B14',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
    marginBottom: 24,
  },
  backArrow: {
    color: '#E0E3E5',
    fontSize: 22,
  },
  headerTitle: {
    color: '#E0E3E5',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Syne-Bold',
    letterSpacing: 0.5,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  shieldContainer: {
    marginBottom: 20,
  },
  shieldOuter: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  shieldInner: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    fontSize: 36,
  },
  securityBadges: {
    flexDirection: 'row',
    gap: 14,
  },
  secBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  secBadgeActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  secBadgeIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Syne-Bold',
    color: '#E0E3E5',
    textAlign: 'center',
    marginBottom: 10,
  },
  securedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  securedIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  securedText: {
    color: '#859399',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionLabel: {
    color: '#859399',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bankRowSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bankEmoji: {
    fontSize: 20,
  },
  bankName: {
    flex: 1,
    color: '#E0E3E5',
    fontSize: 16,
    fontWeight: '600',
  },
  bankArrow: {
    color: '#859399',
    fontSize: 24,
    fontWeight: '300',
  },
  searchLink: {
    alignItems: 'center',
    marginVertical: 18,
  },
  searchLinkText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '600',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 28,
  },
  trustItem: {
    alignItems: 'center',
  },
  trustIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  trustLabel: {
    color: '#859399',
    fontSize: 10,
    fontFamily: 'SpaceMono',
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  connectButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  connectGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  connectText: {
    color: '#04140E',
    fontSize: 17,
    fontWeight: '700',
  },
  disclaimer: {
    color: '#859399',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '500',
  },
  // Error card
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.25)',
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
  errorDismiss: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: '600',
    paddingLeft: 10,
  },
  // Loading overlay
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 11, 20, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#E0E3E5',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
  },
  // Success state
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#36FFC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#36FFC4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  successIcon: {
    fontSize: 50,
    color: '#060B14',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E0E3E5',
    fontFamily: 'Syne-Bold',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#859399',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});

export default ConnectBankScreen;
