const path = {
  //============= Public ==============
  home: '/',
  products: '/our-products',
  aboutUs: '/about-us',
  callback: '/callback',

  //============ Customer ============
  BASE_CUSTOMER: '/customer',
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_PROFILE: '/customer/profile',
  CUSTOMER_REQUESTS: '/customer/rental-requests',
  CUSTOMER_CREATE_REQUEST: '/customer/create-rental-request',
  CUSTOMER_TRANSACTIONS: '/customer/transactions',
  CUSTOMER_CHAT: '/customer/chat/:rentalId',
  CUSTOMER_ACCOUNT: '/customer/account',

  //============= Staff ============
  BASE_STAFF: '/staff',
  DASHBOARD_STAFF: '/staff/dashboard',
  STAFF_PROFILE: '/staff/profile',
  STAFF_REQUESTS: '/staff/rental-requests',
  STAFF_DELIVERIES: '/staff/deliveries',
  STAFF_TRANSACTIONS: '/staff/transactions',
  STAFF_CHAT: '/staff/chat/:rentalId',
  STAFF_ACCOUNT: '/staff/account',
  STAFF_ROBOT_GROUP: '/staff/robot-group',
  STAFF_CONTRACT_DRAFTS: '/staff/contract-drafts',

  //============= Manager ============
  BASE_MANAGER: '/manager',
  DASHBOARD_MANAGER: '/manager/dashboard',
  MANAGER_PROFILE: '/manager/profile',
  MANAGER_REQUESTS: '/manager/rental-requests',
  MANAGER_QUOTES: '/manager/quotes',
  MANAGER_REPORTS: '/manager/reports',
  MANAGER_DRAFTS: '/manager/contract-drafts',
  MANAGER_CONTRACT: '/manager/contract-templates',
  MANAGER_CLAUSES: '/manager/templates-clauses',
  MANAGER_STAFF_ASSIGNMENT: '/manager/staff-assignment',
  
  //============= Admin ============
  BASE_ADMIN: '/admin',
  DASHBOARD_ADMIN: '/admin/dashboard',
}
export default path