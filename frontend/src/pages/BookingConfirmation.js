import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Train as TrainIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  ConfirmationNumber as TicketIcon,
} from '@mui/icons-material';
import { getBookingDetails } from '../store/slices/bookingSlice';

const BookingConfirmation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBooking, loading, error } = useSelector((state) => state.booking);
  const { isOnline } = useSelector((state) => state.offline);

  useEffect(() => {
    const bookingId = location.state?.bookingId;
    if (bookingId) {
      dispatch(getBookingDetails(bookingId));
    }
  }, [dispatch, location.state?.bookingId]);

  const handleDownloadTicket = () => {
    // Implement ticket download functionality
    console.log('Downloading ticket...');
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleShareTicket = () => {
    // Implement share functionality
    console.log('Sharing ticket...');
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

  if (!selectedBooking) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          No booking details found. Please go back to your bookings.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography color="textSecondary" paragraph>
            Your booking has been successfully confirmed. You can find your ticket details below.
          </Typography>

          {!isOnline && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are currently offline. Your ticket will be available when you're back online.
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Booking Details
            </Typography>
            <Box>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTicket}
                sx={{ mr: 1 }}
              >
                Download
              </Button>
              <Button
                startIcon={<PrintIcon />}
                onClick={handlePrintTicket}
                sx={{ mr: 1 }}
              >
                Print
              </Button>
              <Button
                startIcon={<ShareIcon />}
                onClick={handleShareTicket}
              >
                Share
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Train Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrainIcon sx={{ mr: 1 }} />
                      <Typography>
                        {selectedBooking.train.name} ({selectedBooking.train.trainNumber})
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1 }} />
                      <Typography>
                        {selectedBooking.train.source} → {selectedBooking.train.destination}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon sx={{ mr: 1 }} />
                      <Typography>
                        {selectedBooking.train.departureTime} - {selectedBooking.train.arrivalTime}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MoneyIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        ₹{selectedBooking.totalAmount}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Booking Status
                </Typography>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={selectedBooking.status}
                  color="success"
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption" color="textSecondary">
                  Booking ID: {selectedBooking._id}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Passenger Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Seat</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBooking.passengers.map((passenger, index) => (
                      <TableRow key={index}>
                        <TableCell>{passenger.name}</TableCell>
                        <TableCell>{passenger.age}</TableCell>
                        <TableCell>{passenger.gender}</TableCell>
                        <TableCell>{selectedBooking.selectedSeats[index]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<TicketIcon />}
              onClick={() => navigate('/booking-history')}
            >
              View All Bookings
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Book Another Ticket
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default BookingConfirmation; 