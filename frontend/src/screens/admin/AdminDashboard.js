import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// Hooks
import { useAuth } from '../../hooks/useAuth';

// Services
import { getAdminStats, getSystemLogs, cleanupSystem } from '../../services/api';

const { width } = Dimensions.get('window');

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState([]);
  const [timeRange, setTimeRange] = useState('day');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, logsData] = await Promise.all([
        getAdminStats(),
        getSystemLogs('combined', 10),
      ]);
      
      setStats(statsData);
      setSystemLogs(logsData.logs || []);
    } catch (error) {
      showMessage({
        message: 'Failed to load dashboard data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCleanup = async () => {
    try {
      await cleanupSystem();
      showMessage({
        message: 'System cleanup completed',
        type: 'success',
      });
      await loadDashboardData();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Cleanup failed',
        type: 'danger',
      });
    }
  };

  const handleRestartSystem = async () => {
    // Implement system restart
    showMessage({
      message: 'System restart initiated',
      type: 'info',
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const prepareUserGrowthData = () => {
    if (!stats?.userGrowth) return { labels: [], datasets: [] };
    
    return {
      labels: stats.userGrowth.map(item => item.date),
      datasets: [
        {
          data: stats.userGrowth.map(item => item.count),
          color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const prepareRevenueData = () => {
    if (!stats?.revenueData) return { labels: [], datasets: [] };
    
    return {
      labels: stats.revenueData.map(item => item.month),
      datasets: [
        {
          data: stats.revenueData.map(item => item.amount),
        },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#667eea',
    },
  };

  const quickStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: 'account-group',
      color: '#667eea',
      screen: 'AdminUsers',
    },
    {
      title: 'Active Servers',
      value: stats?.activeServers || 0,
      icon: 'server-network',
      color: '#10b981',
      screen: 'AdminServers',
    },
    {
      title: 'Total Coins',
      value: formatNumber(stats?.totalCoins || 0),
      icon: 'coin',
      color: '#f59e0b',
    },
    {
      title: 'Today\'s Revenue',
      value: `$${stats?.todayRevenue || 0}`,
      icon: 'cash',
      color: '#8b5cf6',
    },
  ];

  const adminActions = [
    {
      title: 'User Management',
      icon: 'account-cog',
      color: '#667eea',
      screen: 'AdminUsers',
    },
    {
      title: 'Server Management',
      icon: 'server-security',
      color: '#10b981',
      screen: 'AdminServers',
    },
    {
      title: 'System Logs',
      icon: 'file-document',
      color: '#f59e0b',
      screen: 'AdminLogs',
    },
    {
      title: 'Transactions',
      icon: 'history',
      color: '#8b5cf6',
      screen: 'AdminTransactions',
    },
  ];

  const systemActions = [
    {
      title: 'System Cleanup',
      icon: 'broom',
      color: '#ef4444',
      action: handleCleanup,
    },
    {
      title: 'Restart System',
      icon: 'restart',
      color: '#3b82f6',
      action: handleRestartSystem,
    },
    {
      title: 'Backup Database',
      icon: 'database-export',
      color: '#10b981',
      action: () => {},
    },
    {
      title: 'View Analytics',
      icon: 'chart-box',
      color: '#f59e0b',
      action: () => {},
    },
  ];

  return (
    <Layout headerProps={{ title: 'Admin Dashboard' }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <Card style={styles.welcomeCard} gradient>
          <View style={styles.welcomeContent}>
            <View>
              <Text style={styles.welcomeTitle}>
                Welcome, Admin {user?.name}!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                System Overview & Management
              </Text>
            </View>
            <View style={styles.adminBadge}>
              <Icon name="shield-account" size={24} color="#FFF" />
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {quickStats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => stat.screen && navigation.navigate(stat.screen)}
            >
              <Card style={styles.statCard}>
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <Icon name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.title}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Growth Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>User Growth</Text>
            <View style={styles.timeRangeSelector}>
              {['day', 'week', 'month', 'year'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.timeRangeButton,
                    timeRange === range && styles.timeRangeButtonActive,
                  ]}
                  onPress={() => setTimeRange(range)}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      timeRange === range && styles.timeRangeTextActive,
                    ]}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {stats?.userGrowth?.length > 0 ? (
            <LineChart
              data={prepareUserGrowthData()}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.emptyChart}>
              <Icon name="chart-line" size={48} color="#ccc" />
              <Text style={styles.emptyChartText}>No data available</Text>
            </View>
          )}
        </Card>

        {/* Admin Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {adminActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* System Status */}
        <Card style={styles.systemCard}>
          <Text style={styles.sectionTitle}>System Status</Text>
          
          <View style={styles.systemStats}>
            <View style={styles.systemStat}>
              <Icon name="cpu" size={20} color="#667eea" />
              <Text style={styles.systemStatLabel}>CPU Usage</Text>
              <Text style={styles.systemStatValue}>
                {stats?.systemStatus?.cpu || '0'}%
              </Text>
            </View>
            
            <View style={styles.systemStat}>
              <Icon name="memory" size={20} color="#10b981" />
              <Text style={styles.systemStatLabel}>Memory</Text>
              <Text style={styles.systemStatValue}>
                {stats?.systemStatus?.memory || '0'}%
              </Text>
            </View>
            
            <View style={styles.systemStat}>
              <Icon name="harddisk" size={20} color="#f59e0b" />
              <Text style={styles.systemStatLabel}>Storage</Text>
              <Text style={styles.systemStatValue}>
                {stats?.systemStatus?.storage || '0'}%
              </Text>
            </View>
            
            <View style={styles.systemStat}>
              <Icon name="server" size={20} color="#8b5cf6" />
              <Text style={styles.systemStatLabel}>Uptime</Text>
              <Text style={styles.systemStatValue}>
                {stats?.systemStatus?.uptime || '0'}d
              </Text>
            </View>
          </View>
        </Card>

        {/* System Actions */}
        <Card style={styles.systemActionsCard}>
          <Text style={styles.sectionTitle}>System Management</Text>
          <View style={styles.systemActionsGrid}>
            {systemActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.systemActionItem}
                onPress={action.action}
              >
                <View style={[styles.systemActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.systemActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Recent Logs */}
        <Card style={styles.logsCard}>
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>Recent System Logs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminLogs')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {systemLogs.length > 0 ? (
            <View style={styles.logsList}>
              {systemLogs.slice(0, 5).map((log, index) => (
                <View key={index} style={styles.logItem}>
                  <View style={styles.logContent}>
                    <Text style={styles.logMessage} numberOfLines={1}>
                      {log}
                    </Text>
                    <Text style={styles.logTime}>
                      {new Date().toLocaleTimeString()}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#999" />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyLogs}>
              <Icon name="file-document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyLogsText}>No logs available</Text>
            </View>
          )}
        </Card>

        {/* Critical Alerts */}
        {stats?.alerts && stats.alerts.length > 0 && (
          <Card style={styles.alertsCard}>
            <View style={styles.alertsHeader}>
              <Icon name="alert" size={24} color="#ef4444" />
              <Text style={styles.alertsTitle}>Critical Alerts</Text>
            </View>
            
            <View style={styles.alertsList}>
              {stats.alerts.slice(0, 3).map((alert, index) => (
                <View key={index} style={styles.alertItem}>
                  <Icon name="alert-circle" size={20} color="#ef4444" />
                  <Text style={styles.alertText}>{alert.message}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}
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
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  adminBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
    padding: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 2,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeRangeButtonActive: {
    backgroundColor: '#667eea',
  },
  timeRangeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#FFF',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    marginHorizontal: 4,
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
  systemStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  systemStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  systemActionsCard: {
    marginBottom: 16,
  },
  systemActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  systemActionItem: {
    width: '48%',
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  systemActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  logsCard: {
    marginBottom: 16,
  },
  logsHeader: {
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
  logsList: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#666',
  },
  emptyLogs: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyLogsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  alertsCard: {
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 8,
  },
  alertsList: {
    paddingLeft: 4,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
});

export default AdminDashboard;
