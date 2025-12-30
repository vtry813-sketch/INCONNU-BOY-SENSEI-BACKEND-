export const API_URL = process.env.API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';
export const SESSION_GENERATOR_URL = process.env.SESSION_GENERATOR_URL || 'https://inconnu-tech-web-session-id.onrender.com/';

export const APP_NAME = 'INCONNU HOSTING';
export const APP_VERSION = '1.0.0';

export const SERVER_COST = parseInt(process.env.SERVER_COST) || 10;
export const REFERRAL_BONUS = parseInt(process.env.REFERRAL_BONUS) || 1;
export const INITIAL_COINS = parseInt(process.env.INITIAL_COINS) || 0;

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'inconnuboytech@gmail.com';
export const ADMIN_PHONE = process.env.ADMIN_PHONE || '+554488138425';

export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  dark: '#0f172a',
  light: '#f8fafc',
};

export const SERVER_STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  STARTING: 'starting',
  STOPPING: 'stopping',
  ERROR: 'error',
};

export const SERVER_STATUS_COLORS = {
  running: '#10b981',
  stopped: '#ef4444',
  starting: '#f59e0b',
  stopping: '#f59e0b',
  error: '#dc2626',
};

export const LOG_LEVELS = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
};

export const LOG_LEVEL_COLORS = {
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  success: '#10b981',
};

export const DEFAULT_ENV_VARS = {
  SESSION_ID: '',
  PREFIX: '.',
  OWNER_NUMBER: '',
  SUDO_NUMBER: '',
  OWNER_NAME: 'INCONNU BOY',
  AUTO_STATUS_SEEN: true,
  AUTO_BIO: true,
  AUTO_STATUS_REACT: true,
  AUTO_READ: false,
  AUTO_RECORDING: false,
  AUTO_REACT: false,
  STATUS_READ_MSG: 'Status Viewed by inconnu xd v2 bot',
  ANTILINK: false,
  REJECT_CALL: false,
  NOT_ALLOW: true,
  MODE: 'public',
  WELCOME: false,
};

export const VALIDATION_RULES = {
  SESSION_ID: /^INCONNU~XD~/,
  PHONE_NUMBER: /^[0-9]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  REFERRAL_CODE: /^[A-Z0-9]{6}$/,
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
};

export const NAVIGATION_ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  VERIFY_EMAIL: 'VerifyEmail',
  
  // Main
  HOME: 'Home',
  DASHBOARD: 'Dashboard',
  PROFILE: 'Profile',
  SERVER_DETAIL: 'ServerDetail',
  CREATE_SERVER: 'CreateServer',
  SERVERS: 'Servers',
  REFERRALS: 'Referrals',
  TRANSACTIONS: 'Transactions',
  SETTINGS: 'Settings',
  SUPPORT: 'Support',
  
  // Admin
  ADMIN_DASHBOARD: 'AdminDashboard',
  ADMIN_USERS: 'AdminUsers',
  ADMIN_SERVERS: 'AdminServers',
  ADMIN_LOGS: 'AdminLogs',
  ADMIN_TRANSACTIONS: 'AdminTransactions',
};
