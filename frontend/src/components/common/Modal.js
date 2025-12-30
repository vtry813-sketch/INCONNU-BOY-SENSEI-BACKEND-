import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const Modal = ({
  visible,
  onClose,
  children,
  title,
  showCloseButton = true,
  animationType = 'fade',
  transparent = true,
  position = 'center',
  style,
  contentStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          justifyContent: 'flex-start',
          paddingTop: 60,
        };
      case 'bottom':
        return {
          justifyContent: 'flex-end',
        };
      default:
        return {
          justifyContent: 'center',
        };
    }
  };

  const modalAnimation = {
    opacity: animation,
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  };

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, getPositionStyles()]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modal,
                {
                  backgroundColor: theme.colors.card,
                  ...modalAnimation,
                },
                style,
              ]}
            >
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  {title && (
                    <View style={styles.titleContainer}>
                      <Icon
                        name="server"
                        size={24}
                        color={theme.colors.primary}
                        style={styles.titleIcon}
                      />
                      <Animated.Text
                        style={[
                          styles.title,
                          { color: theme.colors.text },
                        ]}
                      >
                        {title}
                      </Animated.Text>
                    </View>
                  )}
                  {showCloseButton && (
                    <TouchableWithoutFeedback onPress={onClose}>
                      <View style={styles.closeButton}>
                        <Icon
                          name="close"
                          size={24}
                          color={theme.colors.textSecondary}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                </View>
              )}
              <View style={[styles.content, contentStyle]}>{children}</View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  modal: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  content: {
    padding: 20,
  },
});

export default Modal;
