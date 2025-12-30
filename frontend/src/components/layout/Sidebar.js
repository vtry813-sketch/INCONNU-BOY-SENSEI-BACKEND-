import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

const Sidebar = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'view-dashboard',
      screen: 'Dashboard',
    },
    {
      title: 'My Servers',
      icon: 'server',
      screen: 'Servers',
    },
    {
      title: 'Create Server',
      icon: 'plus-circle',
      screen: 'CreateServer',
    },
    {
      title: 'Profile',
      icon: 'account',
      screen: 'Profile',
    },
    {
      title: 'Referral System',
      icon: 'share-variant',
      screen: 'Referrals',
    },
    {
      title: 'Transactions',
      icon: 'history',
      screen: 'Transactions',
    },
    {
      title: 'Settings',
      icon: 'cog',
      screen: 'Settings',
    },
  ];

  const adminItems = [
    {
      title: 'Admin Dashboard',
      icon: 'shield-account',
      screen: 'AdminDashboard',
    },
    {
      title: 'User Management',
      icon: 'account-group',
      screen: 'AdminUsers',
    },
    {
      title: 'Server Management',
      icon: 'server-network',
      screen: 'AdminServers',
    },
    {
      title: 'System Logs',
      icon: 'file-document',
      screen: 'AdminLogs',
    },
  ];

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.sidebar, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
          <View style={styles.coinsSection}>
            <Icon name="coin" size={20} color="#FFD700" />
            <Text style={[styles.coinsText, { color: theme.colors.text }]}>
              {user?.coins || 0} coins
            </Text>
          </View>
        </View>

        <ScrollView style={styles.menuContainer}>
          <Text style={[styles.menuTitle, { color: theme.colors.textSecondary }]}>
            MAIN MENU
          </Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <Icon name={item.icon} size={20} color={theme.colors.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}

          {user?.isAdmin && (
            <>
              <Text style={[styles.menuTitle, { color: theme.colors.textSecondary, marginTop: 24 }]}>
                ADMINISTRATION
              </Text>
              
              {adminItems.map((item, index) => (
                <TouchableOpacity
                  key={`admin-${index}`}
                  style={[styles.menuItem, styles.adminItem]}
                  onPress={() => handleNavigation(item.screen)}
                >
                  <Icon name={item.icon} size={20} color={theme.colors.warning} />
                  <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.colors.error + '20' }]}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color={theme.colors.error} />
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebar: {
    flex: 1,
    width: '85%',
    maxWidth: 320,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#667eea',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
  },
  coinsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  adminItem: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Sidebar;
