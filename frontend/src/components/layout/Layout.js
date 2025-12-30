import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({
  children,
  headerProps,
  showHeader = true,
  showSidebar = true,
  style,
}) => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />

      {showHeader && (
        <Header
          leftIcon="menu"
          onLeftPress={toggleSidebar}
          rightIcon="bell"
          {...headerProps}
        />
      )}

      <View style={[styles.content, style]}>
        {children}
      </View>

      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default Layout;
