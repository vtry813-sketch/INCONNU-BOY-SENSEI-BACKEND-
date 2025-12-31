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
import { Formik } from 'formik';
import * as Yup from 'yup';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import CustomModal from '../../components/common/Modal';

// Services
import {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  addAdminCoins,
  removeAdminCoins,
} from '../../services/api';

const AdminUsers = () => {
  const navigation = useNavigation();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [coinsAction, setCoinsAction] = useState('add'); // 'add' or 'remove'

  useEffect(() => {
    loadUsers();
  }, [page]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAdminUsers(page, 20, searchQuery);
      setUsers(response.users);
      setFilteredUsers(response.users);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      showMessage({
        message: 'Failed to load users',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (values) => {
    try {
      setActionLoading(true);
      await updateAdminUser(selectedUser._id, values);
      showMessage({
        message: 'User updated successfully',
        type: 'success',
      });
      setShowEditModal(false);
      await loadUsers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to update user',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCoins = (user, action) => {
    setSelectedUser(user);
    setCoinsAction(action);
    setShowCoinsModal(true);
  };

  const handleCoinsAction = async (values) => {
    try {
      setActionLoading(true);
      const action = coinsAction === 'add' ? addAdminCoins : removeAdminCoins;
      await action({
        userId: selectedUser._id,
        amount: parseInt(values.amount),
        description: values.description,
      });
      
      showMessage({
        message: `${coinsAction === 'add' ? 'Added' : 'Removed'} ${values.amount} coins successfully`,
        type: 'success',
      });
      
      setShowCoinsModal(false);
      await loadUsers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to update coins',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    if (user.isAdmin) {
      showMessage({
        message: 'Cannot delete admin users',
        type: 'warning',
      });
      return;
    }
    
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      setActionLoading(true);
      await deleteAdminUser(selectedUser._id);
      showMessage({
        message: 'User deleted successfully',
        type: 'success',
      });
      setShowDeleteModal(false);
      await loadUsers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to delete user',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewUser = (user) => {
    navigation.navigate('AdminUserDetail', { userId: user._id });
  };

  const renderUserCard = (user) => (
    <Card key={user._id} style={styles.userCard}>
      <TouchableOpacity
        style={styles.userContent}
        onPress={() => handleViewUser(user)}
      >
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
            {user.isAdmin && (
              <View style={styles.adminBadge}>
                <Icon name="shield-account" size={12} color="#FFF" />
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userReferral}>
              Ref: {user.referralCode || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.userStats}>
            <View style={styles.userStat}>
              <Icon name="coin" size={14} color="#FFD700" />
              <Text style={styles.userStatValue}>{user.coins || 0}</Text>
            </View>
            <View style={styles.userStat}>
              <Icon name="server" size={14} color="#667eea" />
              <Text style={styles.userStatValue}>{user.servers?.length || 0}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.userMeta}>
          <Text style={styles.userMetaText}>
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </Text>
          <Text style={[
            styles.userStatus,
            user.emailVerified ? styles.verified : styles.unverified
          ]}>
            {user.emailVerified ? 'Verified' : 'Unverified'}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditUser(user)}
        >
          <Icon name="pencil" size={16} color="#667eea" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => handleAddCoins(user, 'add')}
        >
          <Icon name="plus" size={16} color="#10b981" />
          <Text style={styles.actionText}>Add Coins</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleAddCoins(user, 'remove')}
        >
          <Icon name="minus" size={16} color="#ef4444" />
          <Text style={styles.actionText}>Remove</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(user)}
        >
          <Icon name="delete" size={16} color="#ef4444" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <Layout headerProps={{ title: 'User Management' }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <Card style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name, email, or referral code..."
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
        </Card>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.filter(u => u.emailVerified).length}
            </Text>
            <Text style={styles.statLabel}>Verified</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.filter(u => u.isAdmin).length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.reduce((sum, user) => sum + (user.coins || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Total Coins</Text>
          </Card>
        </View>

        {/* Users List */}
        <Card style={styles.usersCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Users ({filteredUsers.length})</Text>
            <TouchableOpacity>
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading users...</Text>
            </View>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(renderUserCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="account-group" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No users found</Text>
              {searchQuery ? (
                <Text style={styles.emptySubtext}>
                  Try a different search term
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

      {/* Edit User Modal */}
      <CustomModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        {selectedUser && (
          <Formik
            initialValues={{
              name: selectedUser.name,
              email: selectedUser.email,
              isAdmin: selectedUser.isAdmin,
              emailVerified: selectedUser.emailVerified,
            }}
            onSubmit={handleUpdateUser}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              setFieldValue,
            }) => (
              <View style={styles.modalContent}>
                <Input
                  label="Name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  placeholder="Enter user name"
                />
                
                <Input
                  label="Email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="Enter user email"
                  keyboardType="email-address"
                />
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Admin Privileges</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      values.isAdmin && styles.toggleButtonActive,
                    ]}
                    onPress={() => setFieldValue('isAdmin', !values.isAdmin)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        values.isAdmin && styles.toggleTextActive,
                      ]}
                    >
                      {values.isAdmin ? 'ADMIN' : 'USER'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Email Verified</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      values.emailVerified && styles.toggleButtonActive,
                    ]}
                    onPress={() => setFieldValue('emailVerified', !values.emailVerified)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        values.emailVerified && styles.toggleTextActive,
                      ]}
                    >
                      {values.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Button
                  title={actionLoading ? 'Saving...' : 'Save Changes'}
                  onPress={handleSubmit}
                  variant="primary"
                  size="large"
                  loading={actionLoading}
                  style={styles.modalButton}
                />
                
                <Button
                  title="Cancel"
                  onPress={() => setShowEditModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
              </View>
            )}
          </Formik>
        )}
      </CustomModal>

      {/* Add/Remove Coins Modal */}
      <CustomModal
        visible={showCoinsModal}
        onClose={() => setShowCoinsModal(false)}
        title={`${coinsAction === 'add' ? 'Add' : 'Remove'} Coins`}
      >
        {selectedUser && (
          <Formik
            initialValues={{
              amount: '',
              description: `${coinsAction === 'add' ? 'Added' : 'Removed'} by admin`,
            }}
            validationSchema={Yup.object({
              amount: Yup.number()
                .required('Amount is required')
                .positive('Amount must be positive')
                .integer('Amount must be a whole number'),
              description: Yup.string()
                .required('Description is required')
                .max(500, 'Description too long'),
            })}
            onSubmit={handleCoinsAction}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.modalContent}>
                <View style={styles.userInfoModal}>
                  <Text style={styles.userInfoName}>{selectedUser.name}</Text>
                  <Text style={styles.userInfoEmail}>{selectedUser.email}</Text>
                  <Text style={styles.userInfoCoins}>
                    Current coins: {selectedUser.coins || 0}
                  </Text>
                </View>
                
                <Input
                  label="Amount"
                  value={values.amount}
                  onChangeText={handleChange('amount')}
                  onBlur={handleBlur('amount')}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  error={touched.amount && errors.amount}
                />
                
                <Input
                  label="Description"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={3}
                  error={touched.description && errors.description}
                />
                
                <Button
                  title={
                    actionLoading
                      ? 'Processing...'
                      : `${coinsAction === 'add' ? 'Add' : 'Remove'} Coins`
                  }
                  onPress={handleSubmit}
                  variant={coinsAction === 'add' ? 'success' : 'danger'}
                  size="large"
                  loading={actionLoading}
                  style={styles.modalButton}
                />
                
                <Button
                  title="Cancel"
                  onPress={() => setShowCoinsModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
              </View>
            )}
          </Formik>
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        {selectedUser && (
          <View style={styles.modalContent}>
            <Icon name="alert-circle" size={48} color="#ef4444" />
            
            <Text style={styles.deleteText}>
              Delete {selectedUser.name}?
            </Text>
            
            <Text style={styles.deleteWarning}>
              This action cannot be undone. All user data, servers, and logs will be permanently deleted.
            </Text>
            
            <View style={styles.userInfoDelete}>
              <Text style={styles.userInfoText}>Email: {selectedUser.email}</Text>
              <Text style={styles.userInfoText}>Coins: {selectedUser.coins || 0}</Text>
              <Text style={styles.userInfoText}>
                Servers: {selectedUser.servers?.length || 0}
              </Text>
            </View>
            
            <View style={styles.deleteActions}>
              <Button
                title="Delete User"
                onPress={confirmDeleteUser}
                variant="danger"
                size="large"
                loading={actionLoading}
                style={styles.deleteButton}
              />
              
              <Button
                title="Cancel"
                onPress={() => setShowDeleteModal(false)}
                variant="outline"
                style={styles.deleteButton}
              />
            </View>
          </View>
        )}
      </CustomModal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
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
  usersCard: {
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
  exportText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  userCard: {
    marginBottom: 12,
  },
  userContent: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  adminBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userReferral: {
    fontSize: 12,
    color: '#999',
  },
  userStats: {
    alignItems: 'flex-end',
  },
  userStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userStatValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userMetaText: {
    fontSize: 12,
    color: '#666',
  },
  userStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verified: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
  },
  unverified: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  userActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  editButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  addButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  removeButton: {
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
  modalContent: {
    padding: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  modalButton: {
    marginBottom: 12,
  },
  userInfoModal: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userInfoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userInfoEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userInfoCoins: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f59e0b',
  },
  deleteText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 16,
  },
  deleteWarning: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  userInfoDelete: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  userInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  deleteActions: {
    gap: 12,
  },
  deleteButton: {
    width: '100%',
  },
});

export default AdminUsers;
