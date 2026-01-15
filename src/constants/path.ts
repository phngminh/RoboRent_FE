const path = {
  //============= Public ==============
  home: '/',
  products: '/our-services',
  aboutUs: '/about-us',
  create_request: '/create-request',
  create_request_detail: '/create-request-detail',
  callback: '/callback',

  //============ Customer ============
  BASE_CUSTOMER: '/customer',
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_PROFILE: '/customer/profile',
  CUSTOMER_REQUESTS: '/customer/rental-requests',
  CUSTOMER_CREATE_REQUEST: '/customer/create-rental-request',
  CUSTOMER_TRANSACTIONS: '/customer/transactions',
  CUSTOMER_CHAT: '/customer/chat/:rentalId',
  CUSTOMER_REPORTS: '/customer/breach-reports',
  CUSTOMER_ACCOUNT: '/customer/account',
  SHARE_RENTAL_REQUEST: '/customer/share-rental-request/:rentalId',
  FACE_PROFILE: '/customer/face-profile',
  FACE_PROFILE_CREATE: '/customer/face-profile/create',
  FACE_PROFILE_VERIFY: '/customer/face-profile/verify',
  CUSTOMER_DELIVERY: '/customer/delivery/:rentalId',
  CUSTOMER_CHECKLIST_ACCEPT: '/customer/delivery/:rentalId/checklist',

  //============= Staff ============
  BASE_STAFF: '/staff',
  DASHBOARD_STAFF: '/staff/dashboard',
  STAFF_PROFILE: '/staff/profile',
  STAFF_REQUESTS: '/staff/rental-requests',
  STAFF_DELIVERIES: '/staff/deliveries',
  STAFF_TRANSACTIONS: '/staff/transactions',
  STAFF_CHAT: '/staff/chat/:rentalId',
  STAFF_ACCOUNT: '/staff/account',
  STAFF_REPORTS: '/staff/breach-reports',
  STAFF_ROBOT_GROUP: '/staff/robot-group',
  STAFF_CONTRACT_DRAFTS: '/staff/contract-drafts',
  SHARE_RENTAL_REQUEST_STAFF: '/staff/share-rental-request/:rentalId',

  //============= Manager ============
  BASE_MANAGER: '/manager',
  DASHBOARD_MANAGER: '/manager/dashboard',
  MANAGER_PROFILE: '/manager/profile',
  MANAGER_REQUESTS: '/manager/rental-requests',
  MANAGER_QUOTES: '/manager/quotes',
  MANAGER_REPORTS: '/manager/breach-reports',
  MANAGER_DRAFTS: '/manager/contract-drafts',
  MANAGER_CONTRACT: '/manager/contract-templates',
  MANAGER_CLAUSES: '/manager/templates-clauses',
  MANAGER_STAFF_ASSIGNMENT: '/manager/staff-assignment',
  
  //============= Admin ============
  BASE_ADMIN: '/admin',
  DASHBOARD_ADMIN: '/admin/dashboard',

  //============= Technical Staff ============
  BASE_TECH_STAFF: '/technicalstaff',
  TECH_STAFF_REQUESTS: '/technicalstaff/rental-requests',
}
export default path