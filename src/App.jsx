import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Nav from './components/Nav';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Evaluations from './pages/Evaluations';
import Classes from './pages/Classes';
import Finance from './pages/Finance';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Nav />
      <main>{children}</main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Students />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <StudentDetail />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluations"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Evaluations />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Classes />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Finance />
                  </AppLayout>
                </PrivateRoute>
              }
            />

            {/* Error Pages */}
            <Route path="/500" element={<ServerError />} />
            <Route path="/404" element={<NotFound />} />

            {/* Default redirect */}
            <Route path="*" element={<NotFound />} />
          </Routes>

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
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

