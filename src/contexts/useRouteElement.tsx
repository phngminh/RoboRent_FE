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
import FaceProfilePage from '../pages/customer/profile/faceProfile'
import FaceProfileCreateUI from '../pages/customer/faceProfile/FaceProfileCreateUI'
import FaceVerificationPage from '../pages/customer/faceProfile/FaceProfileVerifyUI'
import ReportDetail from '../pages/manager/report/reportDetail'
import CustomerBreachReports from '../pages/customer/report/customerBreachReports'
import CustomerReportDetail from '../pages/customer/report/customerReportDetail'
import StaffBreachReports from '../pages/staff/report/staffBreachReports'
import StaffReportDetail from '../pages/staff/report/staffReportDetail'
import StaffAssignmentPage from '../pages/manager/StaffAssignmentPage'
import CustomerDeliveryTrackingPage from '../pages/customer/CustomerDeliveryTrackingPage'
import CreateRentalRequestHome from '../pages/home/request/createRentalRequest'
import CreateRentalDetailHome from '../pages/home/request/createRentalRequestDetail'
import { toast } from 'react-toastify'
import TechnicalStaffProfile from '../pages/technicalStaff/profile'
import ActualDeliveryManagement from '../pages/technicalStaff/ActualDeliveryManagement'
import DeliveryChecklistPage from '../pages/technicalStaff/DeliveryChecklistPage'
import CustomerChecklistAcceptPage from '../pages/customer/checklist/CustomerChecklistAcceptPage'

export default function useRouteElements() {
  const navigate = useNavigate()
  const routeElements = useRoutes([
    { path: path.home, element: <Home /> },
    {
      path: path.create_request,
      element: <ProtectedRoute allowedRoles={['customer']} />,
      children: [
        { 
          index: true, 
          element: 
            <CreateRentalRequestHome
              onNextStep={(rentalId, activityTypeId) => navigate(`/create-request-detail/${rentalId}/${activityTypeId}`)} 
            /> 
        }
      ]
    },
    {
      path: `${path.create_request_detail}/:rentalId/:activityTypeId`,
      element: <ProtectedRoute allowedRoles={['customer']} />,
      children: [
        { 
          index: true, 
          element: 
            <CreateRentalDetailHome
              onBack={() => navigate(-1)}
              onSave={() => {
                toast.success('Rental request created successfully!')
                navigate(`${path.BASE_CUSTOMER}/rental-requests`)
              }}
            /> 
        }
      ]
    },
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
            { path: 'transactions', element: <TransactionsContent /> },
            { 
              path: 'breach-reports', 
              element: 
                <CustomerBreachReports
                  onView={(reportId) => navigate(`${path.BASE_CUSTOMER}/breach-reports/${reportId}`)}
                /> 
            },
            { 
              path: 'breach-reports/:reportId', 
              element: 
                <CustomerReportDetail
                  onBack={() => navigate(`${path.BASE_CUSTOMER}/breach-reports`)}
                /> 
            },
            {
              path: '/customer/face-profile',
              element: (
                <FaceProfilePage
                onNotFound={() => navigate(`${path.BASE_CUSTOMER}/face-profile/create`)}
                onUpdate={() => navigate(`${path.BASE_CUSTOMER}/face-profile/create`)}
                onVerify={() => navigate(`${path.BASE_CUSTOMER}/face-profile/verify`)}
                />
              )
            },
            {
              path: '/customer/face-profile/create',
              element: (
                <FaceProfileCreateUI
                onSubmit={() => navigate(`${path.BASE_CUSTOMER}/face-profile`)}
                />
              )
            },
            {
              path: '/customer/face-profile/verify',
              element: (
                <FaceVerificationPage
                onSubmit={() => navigate(`${path.BASE_CUSTOMER}/face-profile`)}
                onBack={() => navigate(`${path.BASE_CUSTOMER}/face-profile`)}
                />
              )
            },
            { path: 'transactions', element: <TransactionsContent /> }
          ]
        },
        { path: 'chat/:rentalId', element: <CustomerChatPage /> },
        { 
          path: 'delivery/:rentalId', 
          element: <CustomerDeliveryTrackingPage /> 
        },
        { path: 'delivery/:rentalId/checklist', element: <CustomerChecklistAcceptPage /> },
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
            },
            { 
              path: 'breach-reports', 
              element: 
                <StaffBreachReports
                  onView={(reportId) => navigate(`${path.BASE_STAFF}/breach-reports/${reportId}`)}
                /> 
            },
            { 
              path: 'breach-reports/:reportId', 
              element: 
                <StaffReportDetail
                  onBack={() => navigate(`${path.BASE_STAFF}/breach-reports`)}
                /> 
            }
          ]
        },
        {
          path: 'chat/:rentalId', 
          element: 
          <StaffChatPage
          onViewContract={() => navigate(`${path.BASE_STAFF}/contract-drafts`)}
           />
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
            { 
              path: 'rental-requests', 
              element: 
                <ManagerRentalRequestsContent 
                  onView={(id) => navigate(`${path.BASE_MANAGER}/share-rental-request/${id}`)}
                /> 
            },
            {
              path: 'share-rental-request/:rentalId',
              element: (
                <ShareRentalRequestDetail
                  onBack={() => navigate(`${path.BASE_MANAGER}/rental-requests`)}
                />
              )
            },
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
        },
        { 
          path: 'staff-assignment', 
          element: <StaffAssignmentPage /> 
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
    },
    //================ TechnicalStaff routes ================
    {
      path: path.BASE_TECH_STAFF, // '/techstaff'
      element: <ProtectedRoute allowedRoles={['technicalstaff']} />,
      children: [
        { index: true, element: <Navigate to='rental-requests' replace /> },
        {
          element: <TechnicalStaffProfile />,
          children: [
            { path: 'rental-requests', element: <ActualDeliveryManagement /> },
            { path: 'deliveries/:actualDeliveryId/checklist', element: <DeliveryChecklistPage /> }
          ]
        }
      ]
    }
  ])
  return routeElements
}