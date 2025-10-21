export const usernameRegex = /^[a-zA-Z0-9_-]+$/;

export const Permissions = {
  // View warnings
  VIEW_WARNINGS: 1n << 3n,
  // View hidden warnings
  VIEW_HIDDEN_WARNINGS: 1n << 4n,
  // Create warnings
  CREATE_WARNINGS: 1n << 5n,
  // Create hidden warnings
  CREATE_HIDDEN_WARNINGS: 1n << 6n,
  // Edit warnings
  EDIT_WARNINGS: 1n << 7n,
  // Delete warnings
  DELETE_WARNINGS: 1n << 8n,

  // View bans
  VIEW_BANS: 1n << 9n,
  // Create bans, without length perms, this'll be kicking only
  CREATE_BANS: 1n << 10n,
  // Edit bans
  EDIT_BANS: 1n << 11n,
  // Delete bans
  DELETE_BANS: 1n << 12n,

  // View roles
  VIEW_ROLES: 1n << 13n,
  // Create and edit roles
  CREATE_EDIT_ROLES: 1n << 14n,
  // Delete roles
  DELETE_ROLES: 1n << 15n,

  // View users
  VIEW_USERS: 1n << 16n,
  // Search users
  SEARCH_USERS: 1n << 17n,

  // Leave of Absence creation
  LOA_CREATE: 1n << 19n,
  // Leave of Absence edit
  LOA_EDIT: 1n << 20n,
  // Leave of Absence delete and ending
  LOA_DELETE_END: 1n << 21n,

  // Bypass Hours
  BYPASS_HOURS: 1n << 22n,

  // Banning for twelve hours
  BAN_TWELVE_HOURS: 1n << 23n,
  // Banning for a day
  BAN_ONE_DAY: 1n << 24n,
  // Banning for a week
  BAN_ONE_WEEK: 1n << 25n,
  // Banning for two weeks
  BAN_TWO_WEEKS: 1n << 26n,
  // Banning for a month
  BAN_ONE_MONTH: 1n << 27n,
  // Banning permanently
  BAN_PERMANENTLY: 1n << 28n,

  // View sessions
  VIEW_SESSIONS: 1n << 29n,
  // Log out all sessions
  LOGOUT_ALL_SESSIONS: 1n << 30n,

  // Alt checking
  ALT_CHECK: 1n << 31n,

  // Custom user badges,
  CUSTOM_USER_BADGES: 1n << 32n,

  // Manage user permission overrides
  USER_PERMISSION_OVERRIDES: 1n << 33n,

  // View ban appeals
  VIEW_BAN_APPEALS: 1n << 36n,
  // Manage ban appeals
  MANAGE_BAN_APPEALS: 1n << 37n,
} as const;

export const UserFlags = {
  // Basic user
  USER: 1n << 0n,
  // Superadmin
  SUPERADMIN: 1n << 1n,

  ...Permissions,
} as const;

export type UserFlagKeys = keyof typeof UserFlags;

// Roles don't have anything unique yet, might in the future so it's better to have this
export const RoleFlags = {
  GROUP: 1n << 2n,

  ...Permissions,
} as const;

export type RoleFlagKeys = keyof typeof RoleFlags;

export const JointFlags = {
  ...UserFlags,
  ...RoleFlags,
} as const;

export type JointFlagKeys = keyof typeof JointFlags;
