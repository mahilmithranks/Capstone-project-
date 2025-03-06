import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store';

// Layout components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchTrains from './pages/SearchTrains';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import TrainManagement from './pages/admin/TrainManagement';
import BookingManagement from './pages/admin/BookingManagement';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchTrains />} />

              {/* Protected routes */}
              <Route
                path="/bookings"
                element={
                  <PrivateRoute>
                    <BookingHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute adminOnly>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/trains"
                element={
                  <PrivateRoute adminOnly>
                    <TrainManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <PrivateRoute adminOnly>
                    <BookingManagement />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
