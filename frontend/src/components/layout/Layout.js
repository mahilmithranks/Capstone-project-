import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Train as TrainIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  DirectionsRailway as RailwayIcon,
  Receipt as ReceiptIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { ROUTES } from '../../config';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.login);
  };

  const menuItems = [
    { text: 'Home', icon: <TrainIcon />, path: ROUTES.home },
    { text: 'Search Trains', icon: <SearchIcon />, path: ROUTES.search },
    ...(isAuthenticated
      ? [
          { text: 'My Bookings', icon: <HistoryIcon />, path: ROUTES.bookings },
          { text: 'Profile', icon: <PersonIcon />, path: ROUTES.profile },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [
          { text: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.admin.dashboard },
          { text: 'Trains', icon: <RailwayIcon />, path: ROUTES.admin.trains },
          { text: 'Bookings', icon: <ReceiptIcon />, path: ROUTES.admin.bookings },
        ]
      : []),
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Train Booking
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Train Ticket Booking
          </Typography>
          {!isAuthenticated && (
            <Box sx={{ ml: 'auto' }}>
              <Button color="inherit" onClick={() => navigate(ROUTES.login)}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate(ROUTES.register)}>
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 