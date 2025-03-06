import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Cancel as CancelIcon,
  Train as TrainIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { getMyBookings, cancelBooking } from '../store/slices/bookingSlice';

const BookingHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading, error } = useSelector((state) => state.booking);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    dispatch(getMyBookings());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (booking) => {
    navigate('/receipt', { state: { bookingId: booking._id } });
  };

  const handleDownloadTicket = (booking) => {
    // Implement ticket download functionality
    console.log('Downloading ticket for booking:', booking._id);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setOpenCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (selectedBooking) {
      await dispatch(cancelBooking(selectedBooking._id));
      setOpenCancelDialog(false);
      setSelectedBooking(null);
    }
  };

  const filterBookings = () => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return activeTab === 0 ? bookingDate >= now : bookingDate < now;
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const filteredBookings = filterBookings();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          My Bookings
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ mb: 3 }}
          >
            <Tab label="Upcoming Bookings" />
            <Tab label="Past Bookings" />
          </Tabs>

          {filteredBookings.length === 0 ? (
            <Alert severity="info">
              No {activeTab === 0 ? 'upcoming' : 'past'} bookings found.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Train</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Passengers</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking._id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrainIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {booking.train.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {booking.train.trainNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {new Date(booking.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {booking.train.departureTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1 }} />
                          <Typography>
                            {booking.passengers.length}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MoneyIcon sx={{ mr: 1 }} />
                          <Typography>
                            ₹{booking.totalAmount}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={
                            booking.status === 'confirmed'
                              ? 'success'
                              : booking.status === 'cancelled'
                              ? 'error'
                              : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewDetails(booking)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Ticket">
                            <IconButton
                              color="primary"
                              onClick={() => handleDownloadTicket(booking)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          {booking.status === 'confirmed' && activeTab === 0 && (
                            <Tooltip title="Cancel Booking">
                              <IconButton
                                color="error"
                                onClick={() => handleCancelClick(booking)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No, Keep It</Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingHistory; 