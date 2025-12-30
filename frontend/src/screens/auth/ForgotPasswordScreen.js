import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';

// Components
import Layout from '../../components/layout/Layout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

// Services
import { forgotPassword } from '../../services/api';

// Validation Schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
});

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (values) => {
    try {
      setLoading(true);
      await forgotPassword(values.email);
      setEmailSent(true);
      showMessage({
        message: 'Password reset email sent!',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to send reset email',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (loading) {
    return <Loader fullScreen message="Sending reset email..." />;
  }

  return (
    <Layout showHeader={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>INCONNU</Text>
            <Text style={styles.subtitle}>HOSTING</Text>
          </View>

          <View style={styles.formContainer}>
            {emailSent ? (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>📧</Text>
                <Text style={styles.successTitle}>
                  Check Your Email
                </Text>
                <Text style={styles.successMessage}>
                  We've sent a password reset link to your email address.
                  Please check your inbox and follow the instructions to reset your password.
                </Text>
                <Text style={styles.note}>
                  The link will expire in 10 minutes.
                </Text>
                <Button
                  title="Back to Login"
                  onPress={handleBackToLogin}
                  variant="primary"
                  style={styles.backButton}
                />
              </View>
            ) : (
              <>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email to receive a reset link
                </Text>

                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={ForgotPasswordSchema}
                  onSubmit={handleForgotPassword}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                  }) => (
                    <View style={styles.form}>
                      <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={touched.email && errors.email}
                        icon="email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />

                      <Button
                        title="Send Reset Link"
                        onPress={handleSubmit}
                        variant="primary"
                        size="large"
                        loading={loading}
                        style={styles.submitButton}
                      />

                      <TouchableOpacity
                        onPress={handleBackToLogin}
                        style={styles.backLink}
                      >
                        <Text style={styles.backLinkText}>
                          ← Back to Login
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#764ba2',
    marginTop: -8,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginBottom: 16,
  },
  backLink: {
    alignItems: 'center',
    padding: 12,
  },
  backLinkText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  note: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    minWidth: 200,
  },
});

export default ForgotPasswordScreen;
