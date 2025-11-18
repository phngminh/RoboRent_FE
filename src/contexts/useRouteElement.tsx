import { useRoutes, Navigate } from 'react-router-dom'
import path from '../constants/path'
import AboutUs from '../pages/home/aboutUs'
import OurProducts from '../pages/home/ourProduct'
import Home from '../pages/home/homePage/homePage'
import ProtectedRoute from './ProtectedRoute'
import CustomerProfile from '../pages/customer/profile/profile'
import CustomerChatPage from '../pages/chat/CustomerChatPage'
import StaffChatPage from '../pages/chat/StaffChatPage'
import ManagerQuotesPage from '../pages/manager/ManagerQuotesPage'
import AuthCallback from '../pages/auth/callback'
import DashboardContent from '../pages/customer/dashboard'
import CustomerRentalRequestsContent from '../pages/customer/RentalRequest/rentalRequest'
import StaffRentalRequestsContent from '../pages/staff/rentalRequest'
import ManagerRentalRequestsContent from '../pages/manager/rentalRequest'
import TransactionsContent from '../pages/customer/transactions'
import AccountProfile from '../pages/customer/profile/account'
import StaffProfile from '../pages/staff/profile'
import ManagerProfile from '../pages/manager/profile'
import Clauses from '../pages/manager/contract/templateClauses'
import BreachReports from '../pages/manager/report/breachReports'
import ContractTemplates from '../pages/manager/contract/allContracts'

export default function useRouteElements() {
  const routeElements = useRoutes([
    { path: path.home, element: <Home /> },
    { path: path.aboutUs, element: <AboutUs /> },
    { path: path.products, element: <OurProducts /> },
    { path: path.callback, element: <AuthCallback /> },
    //================ Customer routes ================
    {
      path: path.BASE_CUSTOMER,
      element: <ProtectedRoute allowedRoles={['customer']} />,
      children: [
        { index: true, element: <Navigate to='dashboard' replace /> },
        {
          element: <CustomerProfile />,
          children: [
            { path: 'dashboard', element: <DashboardContent /> },
            { path: 'account', element: <AccountProfile /> },
            { path: 'rental-requests', element: <CustomerRentalRequestsContent /> },
            { path: 'transactions', element: <TransactionsContent /> }
          ]
        },
        { path: 'chat/:rentalId', element: <CustomerChatPage /> }
      ]
    },
    //================ Staff routes ================
    {
      path: path.BASE_STAFF,
      element: <ProtectedRoute allowedRoles={['staff']} />,
      children: [
        { index: true, element: <Navigate to='dashboard' replace /> },
        {
          element: <StaffProfile />,
          children: [
            { path: 'dashboard', element: <DashboardContent /> },
            { path: 'account', element: <AccountProfile /> },
            { path: 'rental-requests', element: <StaffRentalRequestsContent /> },
            { path: 'transactions', element: <TransactionsContent /> }
          ]
        },
        {
          path: 'chat/:rentalId', element: <StaffChatPage />
        }
      ]
    },
    //================ Manager routes ================
    {
      path: path.BASE_MANAGER,
      element: <ProtectedRoute allowedRoles={['manager']} />,
      children: [
        { index: true, element: <Navigate to='dashboard' replace /> },
        {
          element: <ManagerProfile />,
          children: [
            { path: 'dashboard', element: <DashboardContent /> },
            { path: 'account', element: <AccountProfile /> },
            { path: 'rental-requests', element: <ManagerRentalRequestsContent /> },
            { path: 'quotes', element: <ManagerQuotesPage /> },
            { path: 'contract-templates', element: <ContractTemplates /> },
            { path: 'templates-clauses', element: <Clauses /> },
            { path: 'reports', element: <BreachReports /> }
          ]
        }
      ]
    },
    //================ Admin routes ================
    {
      path: path.BASE_ADMIN,
      element: <ProtectedRoute allowedRoles={['admin']} />,
      children: [
        {
          path: 'quotes',
          element: <ManagerQuotesPage />
        }
      ]
    }
  ])
  return routeElements
}