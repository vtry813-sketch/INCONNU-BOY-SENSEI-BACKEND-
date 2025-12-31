
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal as RNModal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import CustomModal from '../../components/common/Modal';

// Services
import {
  getAdminServers,
  adminServerAction,
  getServerLogs,
} from '../../services/api';

const AdminServers = () => {
  const navigation = useNavigation();
  
  const [servers, setServers] = useState([]);
  const [filteredServers, setFilteredServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedServer, setSelectedServer] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [serverLogs, setServerLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dropdown states
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState('');
  const [statusItems, setStatusItems] = useState([
    { label: 'All Status', value: '' },
    { label: 'Running', value: 'running' },
    { label: 'Stopped', value: 'stopped' },
    { label: 'Starting', value: 'starting' },
    { label: 'Stopping', value: 'stopping' },
    { label: 'Error', value: 'error' },
  ]);

  useEffect(() => {
    loadServers();
  }, [page, statusFilter]);

  useEffect(() => {
    let filtered = servers;
    
    if (searchQuery) {
      filtered = filtered.filter(server =>
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(server => server.status === statusFilter);
    }
    
    setFilteredServers(filtered);
  }, [searchQuery, statusFilter, servers]);

  const loadServers = async () => {
    try {
      setLoading(true);
      const response = await getAdminServers(page, 20, statusFilter);
      setServers(response.servers);
      setFilteredServers(response.servers);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      showMessage({
        message: 'Failed to load servers',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServers();
    setRefreshing(false);
  };

  const handleServerAction = async (action) => {
    try {
      setActionLoading(true);
      await adminServerAction(selectedServer._id, { action });
      
      showMessage({
        message: `Server ${action} initiated`,
        type: 'success',
      });
      
      setShowActionModal(false);
      await loadServers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Action failed',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewLogs = async (server) => {
    try {
      setSelectedServer(server);
      setLogsLoading(true);
      const logs = await getServerLogs(server._id, 100);
      setServerLogs(logs.logs || []);
      setShowLogsModal(true);
    } catch (error) {
      showMessage({
        message: 'Failed to load server logs',
        type: 'danger',
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const handleDeleteServer = (server) => {
    Alert.alert(
      'Delete Server',
      `Are you sure you want to delete server "${server.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleServerAction('delete'),
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return '#10b981';
      case 'stopped': return '#ef4444';
      case 'starting':
      case 'stopping': return '#f59e0b';
      case 'error': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const formatUptime = (ms) => {
    if (!ms) return '0s';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d`;
    return `${hours}h`;
  };

  const renderServerCard = (server) => (
    <Card key={server._id} style={styles.serverCard}>
      <View style={styles.serverHeader}>
        <View style={styles.serverInfo}>
          <Icon name="server" size={24} color="#667eea" />
          <View style={styles.serverDetails}>
            <Text style={styles.serverName}>{server.name}</Text>
            <Text style={styles.serverPort}>Port: {server.port}</Text>
            <Text style={styles.serverOwner}>
              Owner: {server.userId?.email || 'Unknown'}
            </Text>
          </View>
        </View>
        
        <View style={styles.serverStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(server.status) },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(server.status) },
            ]}
          >
            {server.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.serverStats}>
        <View style={styles.statItem}>
          <Icon name="clock" size={14} color="#666" />
          <Text style={styles.statText}>
            Uptime: {formatUptime(server.totalUptime)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="calendar" size={14} color="#666" />
          <Text style={styles.statText}>
            Created: {new Date(server.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="file-document" size={14} color="#666" />
          <Text style={styles.statText}>
            Logs: {server.logs?.length || 0}
          </Text>
        </View>
      </View>
      
      <View style={styles.serverActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewLogs(server)}
        >
          <Icon name="file-document" size={16} color="#3b82f6" />
          <Text style={styles.actionText}>Logs</Text>
        </TouchableOpacity>
        
        {server.status === 'running' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.restartButton]}
              onPress={() => {
                setSelectedServer(server);
                handleServerAction('restart');
              }}
            >
              <Icon name="refresh" size={16} color="#f59e0b" />
              <Text style={styles.actionText}>Restart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={() => {
                setSelectedServer(server);
                handleServerAction('stop');
              }}
            >
              <Icon name="stop" size={16} color="#ef4444" />
              <Text style={styles.actionText}>Stop</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => {
              setSelectedServer(server);
              handleServerAction('start');
            }}
          >
            <Icon name="play" size={16} color="#10b981" />
            <Text style={styles.actionText}>Start</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            setSelectedServer(server);
            handleDeleteServer(server);
          }}
        >
          <Icon name="delete" size={16} color="#ef4444" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <Layout headerProps={{ title: 'Server Management' }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Filters */}
        <Card style={styles.filtersCard}>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search servers by name or owner..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status</Text>
              <DropDownPicker
                open={statusOpen}
                value={statusValue}
                items={statusItems}
                setOpen={setStatusOpen}
                setValue={setStatusValue}
                setItems={setStatusItems}
                onChangeValue={setStatusFilter}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholder="Select status"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
            
            <TouchableOpacity
              style={styles.clearFilters}
              onPress={() => {
                setSearchQuery('');
                setStatusFilter('');
                setStatusValue('');
              }}
            >
              <Icon name="filter-remove" size={20} color="#666" />
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{servers.length}</Text>
            <Text style={styles.statLabel}>Total Servers</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {servers.filter(s => s.status === 'running').length}
            </Text>
            <Text style={styles.statLabel}>Running</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {servers.filter(s => s.status === 'stopped').length}
            </Text>
            <Text style={styles.statLabel}>Stopped</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {servers.filter(s => s.status === 'error').length}
            </Text>
            <Text style={styles.statLabel}>Error</Text>
          </Card>
        </View>

        {/* Servers List */}
        <Card style={styles.serversCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Servers ({filteredServers.length})
            </Text>
            <TouchableOpacity onPress={loadServers}>
              <Icon name="refresh" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading servers...</Text>
            </View>
          ) : filteredServers.length > 0 ? (
            filteredServers.map(renderServerCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="server-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No servers found</Text>
              {searchQuery || statusFilter ? (
                <Text style={styles.emptySubtext}>
                  Try changing your filters
                </Text>
              ) : null}
            </View>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card style={styles.paginationCard}>
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                onPress={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
              >
                <Icon name="chevron-left" size={20} color={page === 1 ? '#ccc' : '#667eea'} />
                <Text style={[styles.pageButtonText, page === 1 && styles.pageButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.pageInfo}>
                Page {page} of {totalPages}
              </Text>
              
              <TouchableOpacity
                style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
                onPress={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
              >
                <Text style={[styles.pageButtonText, page === totalPages && styles.pageButtonTextDisabled]}>
                  Next
                </Text>
                <Icon name="chevron-right" size={20} color={page === totalPages ? '#ccc' : '#667eea'} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Server Logs Modal */}
      <CustomModal
        visible={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title={`Logs - ${selectedServer?.name || 'Server'}`}
      >
        <View style={styles.logsModalContent}>
          {logsLoading ? (
            <View style={styles.logsLoading}>
              <Text>Loading logs...</Text>
            </View>
          ) : serverLogs.length > 0 ? (
            <ScrollView style={styles.logsList}>
              {serverLogs.map((log, index) => (
                <View key={index} style={styles.logEntry}>
                  <Text style={styles.logTimestamp}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.logMessage}>{log.message}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyLogs}>
              <Icon name="file-document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyLogsText}>No logs available</Text>
            </View>
          )}
          
          <Button
            title="Close"
            onPress={() => setShowLogsModal(false)}
            variant="outline"
            style={styles.logsModalButton}
          />
        </View>
      </CustomModal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filtersCard: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 14,
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#666',
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
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  serverCard: {
    marginBottom: 12,
  },
  serverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serverDetails: {
    marginLeft: 12,
    flex: 1,
  },
  serverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  serverPort: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  serverOwner: {
    fontSize: 12,
    color: '#999',
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  serverStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  serverActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  startButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  restartButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  stopButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
  paginationCard: {
    marginBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
    marginHorizontal: 8,
  },
  pageButtonTextDisabled: {
    color: '#ccc',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  logsModalContent: {
    padding: 20,
    maxHeight: 500,
  },
  logsLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logsList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  logEntry: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
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
  logsModalButton: {
    marginTop: 16,
  },
});

export default AdminServers;
