export const ManagementAction = {
  // User management
  VIEW_USERS: "VIEW_USERS",
  DEACTIVATE_USER: "DEACTIVATE_USER",
  ASSIGN_MANAGER: "ASSIGN_MANAGER", // admin only

  // Organization management
  VIEW_ORGANIZATIONS: "VIEW_ORGANIZATIONS",
  APPROVE_ORGANIZATION: "APPROVE_ORGANIZATION", // admin only
  REJECT_ORGANIZATION: "REJECT_ORGANIZATION",
  SET_FEATURED_PARTNER: "SET_FEATURED_PARTNER", // admin only

  // Initiative management
  VIEW_INITIATIVES: "VIEW_INITIATIVES",
  APPROVE_INITIATIVE: "APPROVE_INITIATIVE",
  REJECT_INITIATIVE: "REJECT_INITIATIVE",
  CANCEL_INITIATIVE: "CANCEL_INITIATIVE",
  DELETE_INITIATIVE: "DELETE_INITIATIVE",

  // Participation management
  APPROVE_PARTICIPATION: "APPROVE_PARTICIPATION",
  REJECT_PARTICIPATION: "REJECT_PARTICIPATION",
  KICK_PARTICIPANT: "KICK_PARTICIPANT",

  // Categories
  CREATE_CATEGORY: "CREATE_CATEGORY",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",

  // Support requests
  VIEW_SUPPORT_REQUESTS: "VIEW_SUPPORT_REQUESTS",
  CLOSE_SUPPORT_REQUEST: "CLOSE_SUPPORT_REQUEST",

  // Audit
  VIEW_AUDIT_LOG: "VIEW_AUDIT_LOG",
} as const;

export type ManagementAction =
  (typeof ManagementAction)[keyof typeof ManagementAction];

// Actions restricted to ADMIN only
const ADMIN_ONLY = new Set<ManagementAction>([
  ManagementAction.ASSIGN_MANAGER,
  ManagementAction.APPROVE_ORGANIZATION,
  ManagementAction.SET_FEATURED_PARTNER,
]);

// Full set of privileged actions
const ALL_MANAGEMENT_ACTIONS = new Set<ManagementAction>(
  Object.values(ManagementAction),
);

// Manager gets everything except ADMIN_ONLY
const MANAGER_ACTIONS = new Set<ManagementAction>(
  [...ALL_MANAGEMENT_ACTIONS].filter((a) => !ADMIN_ONLY.has(a)),
);

const POLICY: Record<string, Set<ManagementAction>> = {
  ADMIN: ALL_MANAGEMENT_ACTIONS,
  MANAGER: MANAGER_ACTIONS,
  USER: new Set(),
};

/**
 * PDP evaluation function. Answers "can role perform action?"
 * @param role - the role of the user (ADMIN, MANAGER, USER)
 * @param action - the action to check (one of ManagementAction)
 * @returns boolean - true if the role can perform the action, false otherwise
 */
export function can(role: string, action: ManagementAction): boolean {
  return POLICY[role]?.has(action) ?? false;
}

/**
 * Throws if the role cannot perform the action. Use at PEP boundaries.
 * @param role - the role of the user (ADMIN, MANAGER, USER)
 * @param action - the action to check (one of ManagementAction)
 */
export function enforce(role: string, action: ManagementAction): void {
  if (!can(role, action)) {
    throw new Error(`Forbidden: ${role} cannot perform ${action}`);
  }
}
