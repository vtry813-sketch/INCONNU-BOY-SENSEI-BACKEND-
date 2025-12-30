import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const CoinDisplay = ({ coins, size = 'medium', showLabel = true, style }) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: 8,
          fontSize: 14,
          iconSize: 16,
        };
      case 'large':
        return {
          padding: 16,
          fontSize: 24,
          iconSize: 28,
        };
      default:
        return {
          padding: 12,
          fontSize: 18,
          iconSize: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <LinearGradient
      colors={['#FFD700', '#FFA500']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { padding: sizeStyles.padding }, style]}
    >
      <Icon name="coin" size={sizeStyles.iconSize} color="#FFF" style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.coinAmount, { fontSize: sizeStyles.fontSize }]}>
          {coins || 0}
        </Text>
        {showLabel && (
          <Text style={styles.coinLabel}>COINS</Text>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    marginRight: 8,
  },
  content: {
    alignItems: 'flex-start',
  },
  coinAmount: {
    color: '#FFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coinLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default CoinDisplay;
