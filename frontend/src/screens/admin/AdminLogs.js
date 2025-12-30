import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// Services
import { getSystemLogs, getAdminLogs } from '../../services/api';

const AdminLogs = () => {
  const navigation = useNavigation();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logFile, setLogFile] = useState('combined');
  const [lines, setLines] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [logLevel, setLogLevel] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Dropdown states
  const [logFileOpen, setLogFileOpen] = useState(false);
  const [logFileValue, setLogFileValue] = useState('combined');
  const [logFileItems, setLogFileItems] = useState([
    { label: 'Combined Logs', value: 'combined' },
    { label: 'Error Logs', value: 'error' },
    { label: 'Auth Logs', value: 'auth' },
    { label: 'Server Logs', value: 'server' },
    { label: 'Admin Logs', value: 'admin' },
    { label: 'Bot Logs', value: 'bot' },
  ]);

  const [linesOpen, setLinesOpen] = useState(false);
  const [linesValue, setLinesValue] = useState('100');
  const [linesItems, setLinesItems] = useState([
    { label: '50 lines', value: '50' },
    { label: '100 lines', value: '100' },
    { label: '200 lines', value: '200' },
    { label: '500 lines', value: '500' },
    { label: '1000 lines', value: '1000' },
  ]);

  const [levelOpen, setLevelOpen] = useState(false);
  const [levelValue, setLevelValue] = useState('');
  const [levelItems, setLevelItems] = useState([
    { label: 'All Levels', value: '' },
    { label: 'Error', value: 'error' },
    { label: 'Warning', value: 'warning' },
    { label: 'Info', value: 'info' },
    { label: 'Success', value: 'success' },
  ]);

  useEffect(() => {
    loadLogs();
    
    // Set up auto-refresh if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadLogs();
      }, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [logFile, lines, autoRefresh]);

  useEffect(() => {
    let filtered = logs;
    
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (logLevel) {
      filtered = filtered.filter(log => {
        if (logLevel === 'error') return log.toLowerCase().includes('error');
        if (logLevel === 'warning') return log.toLowerCase().includes('warning');
        if (logLevel === 'info') return log.toLowerCase().includes('info');
        if (logLevel === 'success') return log.toLowerCase().includes('success');
        return true;
      });
    }
    
    setFilteredLogs(filtered);
  }, [searchQuery, logLevel, logs]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await getSystemLogs(logFile, parseInt(lines));
      setLogs(response.logs || []);
      setFilteredLogs(response.logs || []);
    } catch (error) {
      showMessage({
        message: 'Failed to load system logs',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleClearLogs = async () => {
    // Implement log clearing functionality
    showMessage({
      message: 'Log clearing not implemented yet',
      type: 'info',
    });
  };

  const handleExportLogs = async () => {
    // Implement log export functionality
    showMessage({
      message: 'Log export not implemented yet',
      type: 'info',
    });
  };

  const getLogLevel = (log) => {
    const logLower = log.toLowerCase();
    if (logLower.includes('error')) return 'error';
    if (logLower.includes('warning')) return 'warning';
    if (logLower.includes('success')) return 'success';
    if (logLower.includes('info')) return 'info';
    return 'default';
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getLogLevelIcon = (level) => {
    switch (level) {
      case 'error': return 'alert-circle';
      case 'warning': return 'alert';
      case 'success': return 'check-circle';
      case 'info': return 'information';
      default: return 'console';
    }
  };

  const formatLogLine = (log) => {
    // Extract timestamp if present
    const timestampMatch = log.match(/\[(.*?)\]/);
    const message = timestampMatch ? log.replace(timestampMatch[0], '').trim() : log;
    
    return {
      timestamp: timestampMatch ? timestampMatch[1] : '',
      message,
      level: getLogLevel(log),
    };
  };

  return (
    <Layout headerProps={{ title: 'System Logs' }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Filters Card */}
        <Card style={styles.filtersCard}>
          <View style={styles.filtersGrid}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Log File</Text>
              <DropDownPicker
                open={logFileOpen}
                value={logFileValue}
                items={logFileItems}
                setOpen={setLogFileOpen}
                setValue={setLogFileValue}
                setItems={setLogFileItems}
                onChangeValue={setLogFile}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholder="Select log file"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Lines</Text>
              <DropDownPicker
                open={linesOpen}
                value={linesValue}
                items={linesItems}
                setOpen={setLinesOpen}
                setValue={setLinesValue}
                setItems={setLinesItems}
                onChangeValue={(value) => setLines(value || 100)}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholder="Select lines"
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>
          </View>
          
          <View style={styles.filtersGrid}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Log Level</Text>
              <DropDownPicker
                open={levelOpen}
                value={levelValue}
                items={levelItems}
                setOpen={setLevelOpen}
                setValue={setLevelValue}
                setItems={setLevelItems}
                onChangeValue={setLogLevel}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholder="Filter by level"
                zIndex={1000}
                zIndexInverse={3000}
              />
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Search</Text>
              <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search in logs..."
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
            </View>
          </View>
          
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[styles.filterAction, autoRefresh && styles.filterActionActive]}
              onPress={() => setAutoRefresh(!autoRefresh)}
            >
              <Icon
                name={autoRefresh ? 'refresh' : 'refresh'}
                size={20}
                color={autoRefresh ? '#10b981' : '#666'}
              />
              <Text
                style={[
                  styles.filterActionText,
                  autoRefresh && styles.filterActionTextActive,
                ]}
              >
                Auto-refresh
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.filterAction}
              onPress={handleExportLogs}
            >
              <Icon name="download" size={20} color="#666" />
              <Text style={styles.filterActionText}>Export</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.filterAction}
              onPress={handleClearLogs}
            >
              <Icon name="trash-can" size={20} color="#ef4444" />
              <Text style={[styles.filterActionText, { color: '#ef4444' }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Log Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total Lines</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {logs.filter(l => getLogLevel(l) === 'error').length}
            </Text>
            <Text style={[styles.statLabel, { color: '#ef4444' }]}>Errors</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {logs.filter(l => getLogLevel(l) === 'warning').length}
            </Text>
            <Text style={[styles.statLabel, { color: '#f59e0b' }]}>Warnings</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {filteredLogs.length}
            </Text>
            <Text style={styles.statLabel}>Filtered</Text>
          </Card>
        </View>

        {/* Logs Display */}
        <Card style={styles.logsCard}>
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>
              {logFile} Logs ({filteredLogs.length} lines)
            </Text>
            <TouchableOpacity onPress={loadLogs}>
              <Icon name="refresh" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading logs...</Text>
            </View>
          ) : filteredLogs.length > 0 ? (
            <ScrollView style={styles.logsContainer}>
              {filteredLogs.map((log, index) => {
                const formattedLog = formatLogLine(log);
                return (
                  <View key={index} style={styles.logEntry}>
                    <View style={styles.logHeader}>
                      <Icon
                        name={getLogLevelIcon(formattedLog.level)}
                        size={14}
                        color={getLogLevelColor(formattedLog.level)}
                        style={styles.logIcon}
                      />
                      {formattedLog.timestamp && (
                        <Text style={styles.logTimestamp}>
                          {formattedLog.timestamp}
                        </Text>
                      )}
                      <View
                        style={[
                          styles.logLevel,
                          { backgroundColor: `${getLogLevelColor(formattedLog.level)}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.logLevelText,
                            { color: getLogLevelColor(formattedLog.level) },
                          ]}
                        >
                          {formattedLog.level.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.logMessage}>{formattedLog.message}</Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="file-document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No logs found</Text>
              {searchQuery || logLevel ? (
                <Text style={styles.emptySubtext}>
                  Try changing your filters
                </Text>
              ) : null}
            </View>
          )}
        </Card>

        {/* Log Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Log Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="file-document" size={20} color="#667eea" />
              <Text style={styles.infoLabel}>Current File</Text>
              <Text style={styles.infoValue}>{logFile}.log</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="clock" size={20} color="#10b981" />
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="database" size={20} color="#f59e0b" />
              <Text style={styles.infoLabel}>File Size</Text>
              <Text style={styles.infoValue}>
                {Math.round(logs.length * 0.1)} KB
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="alert" size={20} color="#ef4444" />
              <Text style={styles.infoLabel}>Errors Today</Text>
              <Text style={styles.infoValue}>
                {logs.filter(l => getLogLevel(l) === 'error').length}
              </Text>
            </View>
          </View>
          
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Log Level Legend</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>Error</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.legendText}>Warning</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>Success</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.legendText}>Info</Text>
              </View>
            </View>
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
  filtersCard: {
    marginBottom: 16,
  },
  filtersGrid: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  filterGroup: {
    flex: 1,
    marginHorizontal: 8,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  filterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterActionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
  },
  filterActionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  filterActionTextActive: {
    color: '#10b981',
    fontWeight: '500',
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
    padding: 12,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logsContainer: {
    maxHeight: 400,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 8,
  },
  logEntry: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logIcon: {
    marginRight: 8,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  logLevel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logLevelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  logMessage: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 18,
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
  infoCard: {
    marginBottom: 32,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 20,
  },
  infoItem: {
    width: '48%',
    marginHorizontal: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  legend: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default AdminLogs;
