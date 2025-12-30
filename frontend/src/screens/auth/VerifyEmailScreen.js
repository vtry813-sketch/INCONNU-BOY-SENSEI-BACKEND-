import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';

// Components
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

// Services
import { resendVerificationEmail, checkEmailVerification } from '../../services/api';

// Hooks
import { useAuth } from '../../hooks/useAuth';

const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const email = route.params?.email || user?.email;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCheckVerification = async () => {
    try {
      setChecking(true);
      await checkAuth();
      
      if (user?.emailVerified) {
        showMessage({
          message: 'Email verified successfully!',
          type: 'success',
        });
        navigation.navigate('Home');
      } else {
        showMessage({
          message: 'Email not verified yet. Please check your inbox.',
          type: 'warning',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Failed to check verification status',
        type: 'danger',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResending(true);
      await resendVerificationEmail(email);
      setCountdown(60); // 60 seconds cooldown
      showMessage({
        message: 'Verification email sent!',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to resend email',
        type: 'danger',
      });
    } finally {
      setResending(false);
    }
  };

  const handleOpenEmail = () => {
    const url = `mailto:${email}`;
    Linking.openURL(url).catch(() => {
      showMessage({
        message: 'Could not open email app',
        type: 'warning',
      });
    });
  };

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  if (loading) {
    return <Loader fullScreen message="Loading..." />;
  }

  return (
    <Layout showHeader={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          <Text style={styles.title}>Verify Your Email</Text>
          
          <Text style={styles.message}>
            We've sent a verification email to:
          </Text>
          
          <Text style={styles.email}>{email}</Text>

          <Text style={styles.instructions}>
            Please check your inbox and click the verification link to activate your account.
            If you don't see the email, check your spam folder.
          </Text>

          <View style={styles.actions}>
            <Button
              title={checking ? 'Checking...' : 'I\'ve Verified My Email'}
              onPress={handleCheckVerification}
              variant="primary"
              size="large"
              loading={checking}
              style={styles.button}
            />

            <Button
              title={
                countdown > 0
                  ? `Resend Email (${countdown}s)`
                  : 'Resend Verification Email'
              }
              onPress={handleResendEmail}
              variant="outline"
              size="large"
              loading={resending}
              disabled={countdown > 0 || resending}
              style={styles.button}
            />

            <Button
              title="Open Email App"
              onPress={handleOpenEmail}
              variant="secondary"
              size="large"
              icon="email"
              style={styles.button}
            />

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutLink}
            >
              <Text style={styles.logoutText}>
                Not your email? Logout and try again
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              • Check your spam or junk folder{'\n'}
              • Make sure you entered the correct email{'\n'}
              • Wait a few minutes for the email to arrive{'\n'}
              • Contact support if you still haven't received it
            </Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actions: {
    width: '100%',
  },
  button: {
    marginBottom: 12,
  },
  logoutLink: {
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  helpSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default VerifyEmailScreen;
