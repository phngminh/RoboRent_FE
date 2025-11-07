const path = {
  //============= Public ==============
  home: '/',
  callback: '/callback',
  products: '/our-products',
  aboutUs: '/about-us',

  //============ Customer ============
  BASE_CUSTOMER: '/customer',
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_PROFILE: '/customer/profile',
  CUSTOMER_REQUESTS: '/customer/rental-requests',
  CUSTOMER_TRANSACTIONS: '/customer/transactions',
  CUSTOMER_CHAT: '/customer/chat/:rentalId',

  //============= Staff ============
  BASE_STAFF: '/staff',
  DASHBOARD_STAFF: '/staff/dashboard',
  STAFF_PROFILE: '/staff/profile',
  STAFF_CHAT: '/staff/chat/:rentalId',

  //============= Manager ============
  BASE_MANAGER: '/manager',
  DASHBOARD_MANAGER: '/manager/dashboard',
  MANAGER_PROFILE: '/manager/profile',
  MANAGER_QUOTES: '/manager/quotes',

  //============= Admin ============
  BASE_ADMIN: '/admin',
  DASHBOARD_ADMIN: '/admin/dashboard',
}
export default path