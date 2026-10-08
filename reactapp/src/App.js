import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './Components/PrivateRoute';

// Common Components
import Login from './Components/Login';
import Signup from './Components/Signup';
import ForgotPassword from './Components/ForgotPassword';
import HomePage from './Components/HomePage';
import ErrorPage from './Components/ErrorPage';


// Owner Components
import LivestockForm from './OwnerComponents/LivestockForm';
import ViewLivestock from './OwnerComponents/ViewLivestock';
import OwnerViewFeed from './OwnerComponents/OwnerViewFeed';
import MyRequest from './OwnerComponents/MyRequest';
import Feedback from './OwnerComponents/Feedback';

// Supplier Components
import AddFeed from './SupplierComponents/AddFeed';
import ViewFeed from './SupplierComponents/ViewFeed';
import ViewRequest from './SupplierComponents/ViewRequest';
import MedicineForm from './SupplierComponents/MedicineForm'; // Added
import ViewMedicine from './SupplierComponents/ViewMedicine'; // Added
import OwnerViewMedicine from './OwnerComponents/OwnerViewMedicine';
import ViewFeedback from './SupplierComponents/ViewFeedback';
import SupplierDashboard from './SupplierComponents/SupplierDashboard';
import OwnerDashboard from './OwnerComponents/OwnerDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/home"
          element={
            <PrivateRoute allowedRoles={['Owner', 'Supplier']}>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Owner Routes */}
        <Route path="/owner/add-livestock" element={<PrivateRoute allowedRoles={['Owner']}><LivestockForm /></PrivateRoute>} />
        <Route path="/owner/edit-livestock/:id" element={<PrivateRoute allowedRoles={['Owner']}><LivestockForm /></PrivateRoute>} />
        <Route path="/owner/view-livestock" element={<PrivateRoute allowedRoles={['Owner']}><ViewLivestock /></PrivateRoute>} />
        <Route path="/owner/view-feeds" element={<PrivateRoute allowedRoles={['Owner']}><OwnerViewFeed /></PrivateRoute>} />
        <Route path="/owner/my-requests" element={<PrivateRoute allowedRoles={['Owner']}> <MyRequest /></PrivateRoute>} />
        <Route path="/owner/feedback" element={<PrivateRoute allowedRoles={['Owner']}><Feedback /></PrivateRoute>} />
        <Route path="/owner/dashboard" element={<PrivateRoute allowedRoles={['Owner']}> <OwnerDashboard /></PrivateRoute>} />


        <Route
          path="/owner/view-medicines"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <OwnerViewMedicine />
            </PrivateRoute>
          }
        />
       <Route path="/owner/feedback" element={<PrivateRoute allowedRoles={['Owner']}><Feedback /></PrivateRoute>} />
       <Route path="/owner/dashboard" element={ <PrivateRoute allowedRoles={['Owner']}> <OwnerDashboard /></PrivateRoute>}/>

                



        {/* Owner viewing medicines added by suppliers */}
        {/* <Route path="/owner/view-medicines" element={<PrivateRoute allowedRoles={['Owner']}><ViewMedicine /></PrivateRoute>} /> */}

        {/* Supplier Routes */}
        <Route path="/supplier/add-feed" element={<PrivateRoute allowedRoles={['Supplier']}><AddFeed /></PrivateRoute>} />
        <Route path="/supplier/view-feeds" element={<PrivateRoute allowedRoles={['Supplier']}><ViewFeed /></PrivateRoute>} />
        <Route path="/supplier/view-requests" element={<PrivateRoute allowedRoles={['Supplier']}><ViewRequest /></PrivateRoute>} />
        <Route path="/supplier/feedback" element={<PrivateRoute allowedRoles={['Supplier']}><ViewFeedback /></PrivateRoute>} />
        <Route path="/supplier/dashboard" element={ <PrivateRoute allowedRoles={['Supplier']}> <SupplierDashboard /></PrivateRoute>}/>

        {/* Medicine Routes for Supplier */}
        <Route path="/supplier/add-medicine" element={<PrivateRoute allowedRoles={['Supplier']}><MedicineForm /></PrivateRoute>} />
        <Route path="/supplier/edit-medicine/:id" element={<PrivateRoute allowedRoles={['Supplier']}><MedicineForm /></PrivateRoute>} />
        <Route path="/supplier/view-medicines" element={<PrivateRoute allowedRoles={['Supplier']}><ViewMedicine /></PrivateRoute>} />
        <Route path="/supplier/feedback" element={<PrivateRoute allowedRoles={['Supplier']}><ViewFeedback /></PrivateRoute>} />
        <Route path="/supplier/dashboard" element={<PrivateRoute allowedRoles={['Supplier']}> <SupplierDashboard /></PrivateRoute>} />

        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
