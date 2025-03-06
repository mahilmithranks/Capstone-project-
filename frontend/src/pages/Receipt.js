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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Train as TrainIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  ConfirmationNumber as TicketIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { getBookingDetails } from '../store/slices/bookingSlice';

const Receipt = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBooking, loading, error } = useSelector((state) => state.booking);

  useEffect(() => {
    const bookingId = location.state?.bookingId;
    if (bookingId) {
      dispatch(getBookingDetails(bookingId));
    }
  }, [dispatch, location.state?.bookingId]);

  const handleDownload = () => {
    // Implement ticket download functionality
    console.log('Downloading ticket...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/booking-history')}
          sx={{ mb: 3 }}
        >
          Back to Bookings
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Ticket Receipt
            </Typography>
            <Box>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ mr: 1 }}
              >
                Download
              </Button>
              <Button
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ mr: 1 }}
              >
                Print
              </Button>
              <Button
                startIcon={<ShareIcon />}
                onClick={handleShare}
              >
                Share
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
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
                        {new Date(selectedBooking.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 4 }}>
                      Departure: {selectedBooking.train.departureTime} | Arrival: {selectedBooking.train.arrivalTime}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Booking Status
                </Typography>
                <Chip
                  icon={<TicketIcon />}
                  label={selectedBooking.status}
                  color={
                    selectedBooking.status === 'confirmed'
                      ? 'success'
                      : selectedBooking.status === 'cancelled'
                      ? 'error'
                      : 'warning'
                  }
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption" color="textSecondary">
                  Booking ID: {selectedBooking._id}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
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

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Fare Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Base Fare</TableCell>
                      <TableCell align="right">₹{selectedBooking.baseFare}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Taxes & Charges</TableCell>
                      <TableCell align="right">₹{selectedBooking.taxes}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Discount</TableCell>
                      <TableCell align="right">-₹{selectedBooking.discount || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Total Amount</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>₹{selectedBooking.totalAmount}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Payment ID</TableCell>
                      <TableCell align="right">{selectedBooking.paymentId}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Payment Method</TableCell>
                      <TableCell align="right">{selectedBooking.paymentMethod}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Payment Status</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={selectedBooking.paymentStatus}
                          color={selectedBooking.paymentStatus === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Payment Date</TableCell>
                      <TableCell align="right">
                        {new Date(selectedBooking.paymentDate).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              This is a computer-generated receipt and does not require a physical signature.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Receipt; 