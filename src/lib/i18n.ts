const LOCALE = "en-US";

export const messages = {
  common: {
    appName: "Fleetime Labs",
    goHome: "Go Home",
    explore: "Explore",
    tryAgain: "Try Again",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    deleting: "Deleting...",
  },
  about: {
    documentTitle: "About",
    documentDescription:
      "Learn more about Fleetime Labs - a powerful tool for prototyping billing scenarios",
    logoAlt: "Fleetime Labs",
    headerTitle: "About This Project",
    headerDescription:
      "Fleetime Labs helps teams prototype billing journeys using configurable JSON scenarios and reusable interface components.",
    whatIsThisTitle: "What is this?",
    whatIsThisDescription:
      "Fleetime Labs is a powerful tool designed to help teams prototype, test, and visualize billing scenarios through an intuitive interface. Built with modern web technologies, it provides a flexible platform for managing billing workflows and API endpoints.",
    keyFeaturesTitle: "Key Features",
    endpointManagementTitle: "Endpoint Management:",
    endpointManagementDescription:
      "Configure and monitor billing API endpoints with real-time status tracking",
    userAdministrationTitle: "User Administration:",
    userAdministrationDescription:
      "Role-based access control with dedicated user management for administrators",
    jsonDrivenTitle: "JSON-Driven:",
    jsonDrivenDescription:
      "Flexible configuration using JSON scenarios for rapid prototyping",
    modernStackTitle: "Modern Stack:",
    modernStackDescription:
      "Built with React 19, TypeScript, and Vite for optimal performance",
    ourTeamTitle: "Our Team",
    technologyTitle: "Technology",
    technologyDescription:
      "This application leverages cutting-edge technologies including React 19 with the new compiler, TypeScript for type safety, TanStack Query for data fetching, and Tailwind CSS for styling. The component library is built on shadcn/ui with Radix UI primitives.",
    returnHome: "Return home",
  },
  errors: {
    notFoundTitle: "404",
    notFoundDescriptionLine1: "The page you're looking for might have been",
    notFoundDescriptionLine2: "moved or doesn't exist.",
    fallbackTitle: "Something went wrong",
    fallbackDescriptionLine1: "An unexpected error occurred.",
    fallbackDescriptionLine2: "We apologize for the inconvenience.",
  },
  auth: {
    loggedOutTitle: "Logged out",
    loggedOutDocumentDescription: "You have signed out of Fleetime Labs",
    sessionClosed: "Session closed",
    sessionClosedConnector: " with ",
    localAccessCleared: " local access cleared",
    signedOutBadge: "Signed out",
    loggedOutHeading: "You are logged out",
    loggedOutDescription:
      "Your local session is cleared. This page will stay here until you choose to open a new demo session.",
    noActiveAccount: "No active account is connected in this browser.",
    demoLoginPaused: "Automatic demo login is paused on this screen.",
    loginAgain: "Login again",
    loginDocumentTitle: "Login",
    loginDocumentDescription: "Sign in to your Fleetime Labs account",
    expiredWhileActive:
      "Your session has expired. Please log in again to continue.",
    expiredWhileAway:
      "Your session expired while you were away. Please log in again.",
    loginFailedTitle: "Login Failed",
    sessionExpiredTitle: "Session Expired",
    heroCreate: "Create",
    heroConnector: " and ",
    heroManage: " manage                ",
    heroBillingScenarios: " billing scenarios",
    heroSuffix: " effortlessly.",
    demoAccess: "Demo access",
    openingWorkspace: "Opening your workspace",
    openingWorkspaceDescription:
      "We are preparing an admin demo session so you can get straight to the simulator.",
    preparingDemoSessionAriaLabel: "Preparing demo session",
    validatingDemoCredentials: "Validating demo credentials",
    sessionReadyRedirecting: "Session ready. Redirecting...",
    creatingSecureSession: "Creating a secure simulator session",
    welcomeBack: "Welcome back",
    signInDescription: "Enter your username and password to sign in",
    usernameLabel: "Username",
    usernameRequiredError: "Username is required",
    usernamePlaceholder: "Enter your username",
    usernameDescription: "Your unique username for the biller simulator.",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    passwordVisibilityAriaLabel: "Toggle password visibility",
    passwordDescription: "Use at least 8 characters with letters and numbers.",
    passwordMinError: "Password must be at least 8 characters",
    captchaRequiredError: "Please complete the captcha verification",
    signingIn: "Signing in...",
    signIn: "Sign in",
    loginFailed: "Login failed",
    loginSuccessTitle: "Welcome back!",
    loginSuccessDescription: "Signed in as {username}",
    jwtFormatError: "Invalid JWT format",
    jwtRoleError: "Invalid role in JWT token",
    sessionRefreshedTitle: "Session Refreshed",
    sessionRefreshedDescription: "Your session has been extended successfully.",
    refreshFailedTitle: "Refresh Failed",
    refreshFailedDescription: "Unable to refresh session. Please log in again.",
    sessionExpiringTitle: "Session Expiring Soon",
    sessionExpiringLead: "Your session is about to expire.",
    timeRemaining: "Time remaining: {time}",
    sessionExpiringDescription:
      "You will be automatically logged out when the timer reaches zero. Please save your work.",
    logOutNow: "Log Out Now",
    refreshing: "Refreshing...",
    stayLoggedIn: "Stay Logged In",
    logoutConfirmTitle: "Are you sure you want to log out?",
    logoutConfirmDescription:
      "Your local session will be cleared. You can sign in again from the logged-out page.",
    loggingOut: "Logging out...",
    logOut: "Log out",
    sessionLabel: "Session: {time}",
    sessionTimerTitle: "Session Timer",
    hours: "hours",
    minutes: "minutes",
    seconds: "seconds",
    sessionTimerDescription:
      "Your session will automatically refresh before expiration. You'll be logged out when the timer reaches zero.",
    sessionExpiringSoonWarning:
      "Session expiring soon! Your work will be saved automatically.",
  },
  theme: {
    toggleAriaLabel: "Toggle theme",
    toggleTooltip: "Toggle light/dark mode",
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  users: {
    documentTitle: "Users",
    documentDescription: "Manage users and their permissions in Fleetime Labs",
    pageTitle: "Users",
    pageDescription: "Manage users and their permissions",
    emptyTitle: "No users yet",
    emptyDescription:
      "Start building your team by adding users. Assign roles and permissions to manage access to your application.",
    filterPlaceholder: "Filter by username...",
    addTitle: "Add New User",
    editTitle: "Edit User",
    addDescription: "Create a new user account with appropriate permissions.",
    editDescription: "Update user information and permissions.",
    saving: "Saving...",
    creating: "Creating...",
    saveChanges: "Save Changes",
    addUser: "Add User",
    deleteConfirmTitle: "Are you absolutely sure?",
    deleteConfirmDescription:
      "This action cannot be undone. This will permanently delete the user and all associated data.",
    selectAllAriaLabel: "Select all",
    selectRowAriaLabel: "Select row",
    avatarColumn: "Avatar",
    nameColumn: "Name",
    roleColumn: "Role",
    statusColumn: "Status",
    activeStatus: "Active",
    inactiveStatus: "Inactive",
    openMenu: "Open menu",
    actions: "Actions",
    editUser: "Edit user",
    deleteUser: "Delete user",
    usernameLabel: "Username",
    usernamePlaceholder: "Enter username",
    usernameDescription: "Choose a unique username for this user account.",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    hidePassword: "Hide password",
    showPassword: "Show password",
    passwordDescription:
      "Must be at least 8 characters with letters and numbers.",
    roleLabel: "Role",
    rolePlaceholder: "Select user role",
    adminRole: "Admin",
    adminRoleDescription:
      "Full access to manage users, endpoints, and system settings",
    userRole: "User",
    userRoleDescription: "Standard access to view endpoints only",
    roleDescription: "Assign appropriate permissions to this user.",
    activeStatusLabel: "Active Status",
    activeStatusDescription: "Enable or disable access to this user account.",
    usernameMinError: "Username must be at least 3 characters long",
    usernameMaxError: "Username must not exceed 20 characters",
    invalidRoleError: "Invalid role",
    passwordMinError: "Password must be at least 8 characters long",
    passwordLetterError: "Password must contain at least one letter",
    passwordNumberError: "Password must contain at least one number",
  },
  overview: {
    documentTitle: "Overview",
    documentDescription:
      "View your Fleetime Labs statistics, configured endpoints, and response distributions",
    eyebrow: "Billing Simulator",
    pageTitle: "Overview",
    pageDescription:
      "Inspect endpoint coverage, response templates, and account activity without leaving the simulator workspace.",
    readOnlyAnalytics: "Read-only analytics",
    loadError: "Failed to load overview data. Please try refreshing the page.",
    totalEndpointsTitle: "Total Endpoints",
    totalEndpointsDescription: "Configured endpoint routes across all billers",
    totalResponsesTitle: "Total Responses",
    totalResponsesDescription: "Response templates",
    activeResponsesTitle: "Active Responses",
    activeResponsesDescription: "Active templates",
    totalBillersTitle: "Total Billers",
    totalBillersDescription: "Biller systems",
    registeredAccounts: "Registered accounts",
    inactiveUsers: "{count} inactive",
    regularUsers: "{count} regular",
    totalUsersTitle: "Total Users",
    activeUsersTitle: "Active Users",
    adminUsersTitle: "Admin Users",
  },
  endpoints: {
    documentDescription:
      "Manage API endpoints and integrations for billing simulation",
    pageDescription: "Manage your API endpoints and integrations",
    searchPlaceholder: "Search endpoints...",
    viewAriaLabel: "Choose endpoint view",
    gridViewAriaLabel: "Grid view",
    listViewAriaLabel: "List view",
    noSearchResultsTitle: "No endpoints found",
    noSearchResultsDescription:
      "Change the search keyword or reset filters to view the endpoint list.",
    emptyTitle: "No endpoints yet",
    emptyDescription:
      "Start by creating your first API endpoint for an available biller.",
    createFirstButton: "Create First Endpoint",
    noConfiguredResponses: "No configured responses yet",
    noActiveResponseTitle: "No active response set",
    noActiveResponseDescription:
      "Choose a response below, then activate it so this endpoint knows what to return.",
    inactiveResponsesLabel: "Inactive responses",
    trafficLogsLoadErrorTitle: "Failed to load traffic logs",
    trafficLogsEmptyTitle: "No traffic logs yet",
    trafficLogsEmptyDescription:
      "Send a request to this simulator endpoint to see it here.",
    trafficLogsNoResponsesTitle: "No response configured",
    trafficLogsNoResponsesDescription:
      "Create and activate a response before sending traffic to this endpoint.",
    trafficLogsNoActiveResponseTitle: "No active response set",
    trafficLogsNoActiveResponseDescription:
      "Activate one response before sending traffic, or requests will not have a configured simulator result.",
    trafficLogsEmergencyFooter: "simulator blocked: response unset.",
    addEndpoint: "Add Endpoint",
    addEndpointDescription:
      "Create a new API endpoint for a specific biller ID.",
    saveEndpointTooltip: "Save endpoint changes",
    cancelEndpointEditTooltip: "Cancel endpoint edit",
    editEndpointTooltip: "Edit endpoint URL and method",
    deleteEndpointTooltip: "Delete endpoint and all responses",
    creating: "Creating...",
    createEndpoint: "Create Endpoint",
    addResponse: "Add Response",
    addNewResponse: "Add New Response",
    addResponseDescription:
      "Create a new response configuration for this endpoint",
    adding: "Adding...",
    exportToPostman: "Export to Postman",
    exportToPostmanDescription:
      "Select which biller groups you want to export. Both the collection and environment files will be downloaded. The environment includes the base URL configured in your application.",
    tour: {
      startButton: "Start tour",
      workspaceTitle: "Endpoint workspace",
      workspaceDescription:
        "This is the main workspace for managing simulated biller API endpoints.",
      createFirstTitle: "Create the first endpoint",
      createFirstDescription:
        "Start here when the workspace is empty. This opens the endpoint form so you can define the first simulated API.",
      addEndpointTitle: "Add endpoints",
      addEndpointDescription:
        "Use this to add another endpoint with a biller, method, path, and responses.",
      searchTitle: "Search endpoints",
      searchDescription:
        "Filter the endpoint catalog quickly by URL, method, biller, or response details.",
      viewModeTitle: "Change the view",
      viewModeDescription:
        "Switch between grid and list layouts depending on whether you want cards or denser scanning.",
      exportTitle: "Export to Postman",
      exportDescription:
        "Export the visible endpoint groups into a Postman collection for quick testing.",
      detailsTitle: "Open endpoint details",
      detailsDescription:
        "Open an endpoint to edit its method or URL, add responses, and inspect traffic logs.",
    },
    detailTour: {
      headerTitle: "Endpoint details",
      headerDescription:
        "This header shows the endpoint method, path, biller ID, response count, and quick actions.",
      editActionsTitle: "Edit endpoint",
      editActionsDescription:
        "Use these controls to update the endpoint method or path, or remove the endpoint when it is no longer needed.",
      addResponseTitle: "Add responses",
      addResponseDescription:
        "Create another response variant for this endpoint, including status code, JSON body, delay, and timeout simulation.",
      responsesTitle: "Manage responses",
      responsesDescription:
        "Select a response, activate the one the simulator should return, or switch between active and inactive variants.",
      previewTitle: "Preview the result",
      previewDescription:
        "Review the selected response body, copy the simulator URL, and generate request code for quick testing.",
      trafficLogsTitle: "Inspect traffic",
      trafficLogsDescription:
        "Watch requests that hit this endpoint, filter by status, copy or download logs, and open individual request details.",
    },
    methodLabel: "Method",
    methodPlaceholder: "Select method",
    methodDescription:
      "Choose the HTTP method this endpoint should respond to.",
    methodTooltip: {
      GET: "GET reads data without changing server state.",
      POST: "POST creates or submits data to the server.",
      PUT: "PUT replaces an existing resource with a full update.",
      PATCH: "PATCH applies a partial update to an existing resource.",
      DELETE: "DELETE removes a resource from the server.",
    },
    urlLabel: "URL",
    urlPlaceholder: "/rest/api/users",
    urlDescription:
      "Enter a valid API path starting with / (e.g., /rest, /rest/api, /api/v1/users)",
    billerLabel: "Biller",
    billerPlaceholder: "Select a biller",
    billersLoading: "Loading billers...",
    billerDescription: "Select the biller this endpoint belongs to.",
    responseNameLabel: "Name",
    responseNamePlaceholder: "e.g., success_response, error_response",
    responseNameDescription: "A descriptive name for this response",
    statusCodeLabel: "Status Code",
    statusCodePlaceholder: "200",
    statusCodeDescription: "HTTP status code (100-599)",
    jsonResponseLabel: "JSON Response",
    jsonResponsePlaceholder: '{"key": "value"}',
    jsonResponseDescription: "The JSON response body (must be valid JSON)",
    activateLabel: "Activate",
    activateDescription: "Set this as the active response for the endpoint",
    selectStatusCode: "Select a status code",
    searchStatusCodes: "Search status codes...",
    noStatusCodeFound: "No status code found.",
    successStatusGroup: "Success (2xx)",
    redirectionStatusGroup: "Redirection (3xx)",
    clientErrorStatusGroup: "Client Errors (4xx)",
    serverErrorStatusGroup: "Server Errors (5xx)",
    editResponseName: "Edit Response Name",
    editStatusCode: "Edit Status Code",
    editJsonResponse: "Edit JSON Response",
    editResponse: "Edit Response",
    editResponseNameDescription:
      "Update the name of this response configuration.",
    editStatusCodeDescription: "Update the HTTP status code for this response.",
    editJsonResponseDescription: "Update the JSON response body.",
    editResponseDescription: "Update this response configuration.",
    editResponseTooltip: "Edit {name}",
    selectResponseToEditTooltip: "Select {name} to edit",
    simulateResponseTooltip: "Simulate timeout or delay for {name}",
    selectResponseToSimulateTooltip: "Select {name} to configure simulation",
    activateResponseTooltip: "Activate {name}",
    deactivateResponseTooltip: "Deactivate {name}",
    urlRequiredError: "URL is required",
    urlMaxError: "URL must not exceed {max} characters",
    urlStartError: "URL must start with /",
    urlPathError:
      "URL must be a valid API path (e.g., /rest, /rest/api, /api/v1/users)",
    billerNumberError: "Biller ID must be a number",
    billerIntegerError: "Biller ID must be an integer",
    billerMinError: "Biller ID must be at least 1",
    nameRequiredError: "Name is required",
    nameTooLongError: "Name is too long",
    jsonRequiredError: "JSON content is required",
    invalidJsonError: "Invalid JSON format",
    statusCodeRangeError: "Status code must be between 100-599",
    responseCount: {
      one: "{count} response",
      other: "{count} responses",
    },
  },
} as const;

type MessageValue = string | Record<string, string>;
type MessageVariables = Record<string, string | number>;

const pluralRules = new Intl.PluralRules(LOCALE);

export function formatMessage(
  message: string,
  variables: MessageVariables = {}
) {
  return Object.entries(variables).reduce(
    (formattedMessage, [key, value]) =>
      formattedMessage.replaceAll(`{${key}}`, String(value)),
    message
  );
}

export function formatPluralMessage(
  message: MessageValue,
  count: number,
  variables: MessageVariables = {}
) {
  if (typeof message === "string") {
    return formatMessage(message, { count, ...variables });
  }

  const pluralCategory = pluralRules.select(count);
  const selectedMessage = message[pluralCategory] ?? message.other;

  return formatMessage(selectedMessage, { count, ...variables });
}
