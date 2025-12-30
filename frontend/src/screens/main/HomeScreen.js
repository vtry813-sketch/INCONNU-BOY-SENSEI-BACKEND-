import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import CoinDisplay from '../../components/custom/CoinDisplay';
import ServerCard from '../../components/custom/ServerCard';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { useServers } from '../../hooks/useServers';

// Services
import { getSystemStats } from '../../services/api';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { servers, loading, refreshServers, startServer, stopServer, restartServer, deleteServer } = useServers();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getSystemStats();
      setStats(data);
    } catch (error) {
      showMessage({
        message: 'Failed to load system stats',
        type: 'danger',
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshServers(), loadStats()]);
    setRefreshing(false);
  };

  const handleCreateServer = () => {
    navigation.navigate('CreateServer');
  };

  const handleViewAllServers = () => {
    navigation.navigate('Servers');
  };

  const handleStartServer = async (serverId) => {
    try {
      await startServer(serverId);
      showMessage({
        message: 'Server started successfully',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to start server',
        type: 'danger',
      });
    }
  };

  const handleStopServer = async (serverId) => {
    try {
      await stopServer(serverId);
      showMessage({
        message: 'Server stopped successfully',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to stop server',
        type: 'danger',
      });
    }
  };

  const handleRestartServer = async (serverId) => {
    try {
      await restartServer(serverId);
      showMessage({
        message: 'Server restarted successfully',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to restart server',
        type: 'danger',
      });
    }
  };

  const handleDeleteServer = async (serverId) => {
    try {
      await deleteServer(serverId);
      showMessage({
        message: 'Server deleted successfully',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to delete server',
        type: 'danger',
      });
    }
  };

  const handleViewServer = (server) => {
    navigation.navigate('ServerDetail', { serverId: server._id });
  };

  const runningServers = servers?.filter(s => s.status === 'running') || [];
  const recentServers = servers?.slice(0, 3) || [];

  return (
    <Layout headerProps={{ title: 'Dashboard' }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <Card style={styles.welcomeCard} gradient>
          <View style={styles.welcomeContent}>
            <View>
              <Text style={styles.welcomeTitle}>
                Welcome back, {user?.name || 'User'}! 👋
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Manage your WhatsApp bots and servers
              </Text>
            </View>
            <CoinDisplay coins={user?.coins} size="small" />
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="server" size={24} color="#667eea" />
              <Text style={styles.statValue}>
                {servers?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Total Servers</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="play-circle" size={24} color="#10b981" />
              <Text style={styles.statValue}>
                {runningServers.length}
              </Text>
              <Text style={styles.statLabel}>Running</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="coin" size={24} color="#FFD700" />
              <Text style={styles.statValue}>
                {user?.coins || 0}
              </Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleCreateServer}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(102, 126, 234, 0.1)' }]}>
                <Icon name="plus" size={24} color="#667eea" />
              </View>
              <Text style={styles.actionText}>Create Server</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Icon name="account" size={24} color="#10b981" />
              </View>
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Referrals')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Icon name="share-variant" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.actionText}>Referrals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Transactions')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Icon name="history" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionText}>Transactions</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Servers */}
        <Card style={styles.serversCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Servers</Text>
            {servers?.length > 3 && (
              <TouchableOpacity onPress={handleViewAllServers}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentServers.length > 0 ? (
            recentServers.map((server) => (
              <ServerCard
                key={server._id}
                server={server}
                onPress={() => handleViewServer(server)}
                onStart={handleStartServer}
                onStop={handleStopServer}
                onRestart={handleRestartServer}
                onDelete={handleDeleteServer}
                style={styles.serverCard}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="server-off" size={48} color="#666" />
              <Text style={styles.emptyText}>No servers yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first server to get started
              </Text>
              <Button
                title="Create Server"
                onPress={handleCreateServer}
                variant="primary"
                style={styles.createButton}
              />
            </View>
          )}
        </Card>

        {/* System Status */}
        {stats && (
          <Card style={styles.systemCard}>
            <Text style={styles.sectionTitle}>System Status</Text>
            <View style={styles.systemStats}>
              <View style={styles.systemStat}>
                <Icon name="account-group" size={20} color="#667eea" />
                <Text style={styles.systemStatValue}>
                  {stats.totalUsers?.toLocaleString() || 0}
                </Text>
                <Text style={styles.systemStatLabel}>Total Users</Text>
              </View>
              <View style={styles.systemStat}>
                <Icon name="server-network" size={20} color="#10b981" />
                <Text style={styles.systemStatValue}>
                  {stats.totalServers?.toLocaleString() || 0}
                </Text>
                <Text style={styles.systemStatLabel}>Active Servers</Text>
              </View>
              <View style={styles.systemStat}>
                <Icon name="coin" size={20} color="#FFD700" />
                <Text style={styles.systemStatValue}>
                  {stats.totalCoins?.toLocaleString() || 0}
                </Text>
                <Text style={styles.systemStatLabel}>Total Coins</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Get Session ID */}
        <Card style={styles.sessionCard} gradient>
          <View style={styles.sessionContent}>
            <Icon name="key" size={32} color="#FFF" />
            <View style={styles.sessionText}>
              <Text style={styles.sessionTitle}>Need Session ID?</Text>
              <Text style={styles.sessionSubtitle}>
                Generate WhatsApp session for your bot
              </Text>
            </View>
            <Button
              title="Get Session"
              onPress={() => navigation.navigate('SessionGenerator')}
              variant="secondary"
              size="small"
            />
          </View>
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  serversCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  serverCard: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    minWidth: 160,
  },
  systemCard: {
    marginBottom: 16,
  },
  systemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  systemStat: {
    alignItems: 'center',
    flex: 1,
  },
  systemStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  systemStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  sessionCard: {
    marginBottom: 32,
  },
  sessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionText: {
    flex: 1,
    marginLeft: 16,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default HomeScreen;
