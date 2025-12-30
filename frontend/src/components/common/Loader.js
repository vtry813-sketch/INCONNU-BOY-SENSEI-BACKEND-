import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../../context/ThemeContext';

const Loader = ({
  size = 'medium',
  type = 'default',
  message,
  fullScreen = false,
  style,
}) => {
  const { theme } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'small';
    }
  };

  const renderLoader = () => {
    if (type === 'lottie') {
      return (
        <LottieView
          source={require('../../assets/animations/loading.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      );
    }

    return (
      <ActivityIndicator
        size={getSize()}
        color={theme.colors.primary}
      />
    );
  };

  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, style]}>
        {renderLoader()}
        {message && (
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderLoader()}
      {message && (
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Loader;
