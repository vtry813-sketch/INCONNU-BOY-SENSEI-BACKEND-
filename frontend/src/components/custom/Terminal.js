import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const { height } = Dimensions.get('window');

const Terminal = ({ logs = [], onSendCommand, title = 'Terminal', style }) => {
  const { theme } = useTheme();
  const [command, setCommand] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollViewRef = useRef();

  useEffect(() => {
    if (autoScroll && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);

  const handleSendCommand = () => {
    if (command.trim()) {
      onSendCommand(command);
      setCommand('');
    }
  };

  const formatLogTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.text;
    }
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'success':
        return 'check-circle';
      case 'info':
        return 'information';
      default:
        return 'console-line';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Icon name="console" size={20} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.logCount, { color: theme.colors.textSecondary }]}>
            {logs.length} logs
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setAutoScroll(!autoScroll)}
          style={styles.autoScrollButton}
        >
          <Icon
            name={autoScroll ? 'pin' : 'pin-off'}
            size={20}
            color={autoScroll ? theme.colors.success : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.logsContainer}
        showsVerticalScrollIndicator={false}
      >
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="console" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No logs available
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Start your server to see logs here
            </Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Icon
                  name={getLogIcon(log.level)}
                  size={14}
                  color={getLogColor(log.level)}
                  style={styles.logIcon}
                />
                <Text style={[styles.logTime, { color: theme.colors.textSecondary }]}>
                  {formatLogTime(log.timestamp)}
                </Text>
                <View style={[styles.logLevel, { backgroundColor: getLogColor(log.level) + '20' }]}>
                  <Text style={[styles.logLevelText, { color: getLogColor(log.level) }]}>
                    {log.level.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.logMessage, { color: theme.colors.text }]}>
                {log.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.commandInputContainer}>
        <TextInput
          style={[
            styles.commandInput,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={command}
          onChangeText={setCommand}
          placeholder="Enter command..."
          placeholderTextColor={theme.colors.textSecondary}
          onSubmitEditing={handleSendCommand}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSendCommand}
          disabled={!command.trim()}
        >
          <Icon name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: height * 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 12,
  },
  logCount: {
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  autoScrollButton: {
    padding: 4,
  },
  logsContainer: {
    padding: 16,
    maxHeight: height * 0.4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  logEntry: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logIcon: {
    marginRight: 8,
  },
  logTime: {
    fontSize: 12,
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
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  commandInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  commandInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Terminal;
