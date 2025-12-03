import { useRoutes, Navigate, useNavigate } from 'react-router-dom'
import path from '../constants/path'
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
import ShareRentalRequestDetail from '../pages/rental/ShareRentalRequestDetail'
import DeliveryTrackingPage from '../pages/staff/DeliveryTrackingPage'
import RobotGroupContent from '../pages/staff/robotGroup'
import ScheduleBoard from '../pages/staff/scheduleBoard'
import CreateRentalRequestContent from '../pages/customer/RentalRequest/createRentalRequest'
import CreateRentalDetailContent from '../pages/customer/RentalDetail/CreateRentalDetailContent'
import ContractDrafts from '../pages/manager/contractDraft/contractDrafts'
import DetailContractDraft from '../pages/manager/contractDraft/detailContractDraft'
import CustomerContractDraft from '../pages/customer/contract/customerContractDraft'
import StaffContractDrafts from '../pages/staff/contract/staffContractDrafts'
import StaffDetailContractDraft from '../pages/staff/contract/detailContractDraft'
import ReportDetail from '../pages/manager/report/reportDetail'

export default function useRouteElements() {
  const navigate = useNavigate()
  const routeElements = useRoutes([
    { path: path.home, element: <Home /> },
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
            {
              path: 'rental-requests',
              element: (
                <CustomerRentalRequestsContent 
                  onCreate={() => navigate(`${path.BASE_CUSTOMER}/create-rental-request`)}
                  onView={(rentalId) => navigate(`${path.BASE_CUSTOMER}/create-rental-request/${rentalId}`)}
                  onViewContract={(rentalId) => navigate(`${path.BASE_CUSTOMER}/contract-draft/${rentalId}`)}
                  onDetaild={(rentalId) => navigate(`${path.BASE_CUSTOMER}/share-rental-request/${rentalId}`)}
                />
              )
            },
            {
              path: 'share-rental-request/:rentalId',
              element: (
                <ShareRentalRequestDetail
                  onBack={() => navigate(`${path.BASE_CUSTOMER}/rental-requests`)}
                />
              )
            },
            {
              path: 'contract-draft/:rentalId',
              element: (
                <CustomerContractDraft
                  onBack={() => navigate(`${path.BASE_CUSTOMER}/rental-requests`)}
                />
              )
            },
            {
              path: 'create-rental-request',
              element: (
                <CreateRentalRequestContent
                  onBack={() => navigate(`${path.BASE_CUSTOMER}/rental-requests`)}
                  onNextStep={(rentalId, activityTypeId) =>
                    navigate(`${path.BASE_CUSTOMER}/create-rental-detail/${rentalId}/${activityTypeId}`)
                  }
                />
              )
            },
            {
              path: 'create-rental-request/:rentalId',
              element: (
                <CreateRentalRequestContent
                  onBack={() => navigate(`${path.BASE_CUSTOMER}/rental-requests`)}
                  onNextStep={(rentalId, activityTypeId) =>
                    navigate(`${path.BASE_CUSTOMER}/create-rental-detail/${rentalId}/${activityTypeId}`)
                  }
                />
              )
            },
            {
              path: 'create-rental-detail/:rentalId/:activityTypeId',
              element: (
                <CreateRentalDetailContent 
                  onBack={(rentalId) =>
                    navigate(`${path.BASE_CUSTOMER}/create-rental-request/${rentalId}`)
                  }
                  onSave={() => navigate(`${path.BASE_CUSTOMER}/rental-requests`)}
                />
              )
            },
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
            { 
              path: 'rental-requests', 
              element: 
              <StaffRentalRequestsContent
                onView={(id) => navigate(`${path.BASE_STAFF}/share-rental-request/${id}`)}
              /> 
            },
            { 
              path: 'contract-drafts', 
              element: 
              <StaffContractDrafts 
                onView={(id) => navigate(`${path.BASE_STAFF}/contract-drafts/${id}`)}
              /> 
            },
            { 
              path: 'contract-drafts/:draftId', 
              element: 
              <StaffDetailContractDraft 
                onBack={() => navigate(`${path.BASE_STAFF}/contract-drafts`)}
              /> 
            },
            {
              path: 'share-rental-request/:rentalId',
              element: (
                <ShareRentalRequestDetail
                  onBack={() => navigate(`${path.BASE_STAFF}/rental-requests`)}
                  onNavigateToScheduleBoard={(groupId) => navigate(`${path.BASE_STAFF}/schedule-board/${groupId}`)}
                />
              )
            },
            { path: 'transactions', element: <TransactionsContent /> },
            { 
              path: 'rental/:id', 
              element: 
              <ShareRentalRequestDetail 
                onBack={() => navigate(`${path.BASE_STAFF}/rental-requests`)} 
              />
            },
            { path: 'deliveries', element: <DeliveryTrackingPage /> },
            { path: 'robot-group', element: <RobotGroupContent /> },
            { 
              path: 'schedule-board/:groupId', 
              element: 
              <ScheduleBoard
                onBack={() => navigate(`${path.BASE_STAFF}/robot-group`)}
              /> 
            }
          ]
        },
        {
          path: 'chat/:rentalId', element: <StaffChatPage />
        },
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
            { 
              path: 'contract-drafts', 
              element: 
              <ContractDrafts 
                onView={(draftId) => navigate(`${path.BASE_MANAGER}/contract-drafts/${draftId}`)}
              /> 
            },
            { 
              path: 'contract-drafts/:draftId', 
              element: 
              <DetailContractDraft 
                onBack={() => navigate(`${path.BASE_MANAGER}/contract-drafts`)}
              /> 
            },
            { path: 'contract-templates', element: <ContractTemplates /> },
            { path: 'templates-clauses', element: <Clauses /> },
            { 
              path: 'breach-reports', 
              element: 
                <BreachReports 
                  onView={(reportId) => navigate(`${path.BASE_MANAGER}/breach-reports/${reportId}`)}
                /> 
            },
            { 
              path: 'breach-reports/:reportId', 
              element: 
                <ReportDetail 
                  onBack={() => navigate(`${path.BASE_MANAGER}/breach-reports`)}
                /> 
            }
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