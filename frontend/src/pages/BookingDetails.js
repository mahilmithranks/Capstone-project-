import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Train as TrainIcon,
  Person as PersonIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Seat as SeatIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { getBookingDetails, downloadTicket } from '../store/slices/bookingSlice';
import { ROUTES } from '../config';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedBooking, loading, error } = useSelector((state) => state.bookings);
  const { isOnline } = useSelector((state) => state.offline);

  useEffect(() => {
    if (bookingId) {
      dispatch(getBookingDetails(bookingId));
    }
  }, [dispatch, bookingId]);

  const handleDownloadTicket = async () => {
    await dispatch(downloadTicket(bookingId));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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

  if (!selectedBooking) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Booking not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navigate(ROUTES.BOOKING_HISTORY)} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">Booking Details</Typography>
            </Box>
            <Box>
              {selectedBooking.status.toLowerCase() === 'confirmed' && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadTicket}
                    sx={{ mr: 1 }}
                  >
                    Download Ticket
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => navigate(`${ROUTES.RECEIPT}/${bookingId}`)}
                  >
                    View Receipt
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {!isOnline && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are currently offline. Some features may be limited.
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Booking Status */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  Status:
                </Typography>
                <Chip
                  label={selectedBooking.status}
                  color={getStatusColor(selectedBooking.status)}
                  size="small"
                />
              </Box>
            </Grid>

            {/* Train Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Train Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrainIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">{selectedBooking.train.name}</Typography>
                        <Chip
                          label={selectedBooking.train.type}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 1 }} />
                        <Typography>
                          {selectedBooking.train.source} → {selectedBooking.train.destination}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1 }} />
                        <Typography>
                          {formatTime(selectedBooking.train.departureTime)} -{' '}
                          {formatTime(selectedBooking.train.arrivalTime)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon sx={{ mr: 1 }} />
                        <Typography>
                          {formatDate(selectedBooking.train.departureTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MoneyIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          ${selectedBooking.totalAmount}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SeatIcon sx={{ mr: 1 }} />
                        <Typography>
                          {selectedBooking.seats.length} Seat(s)
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Passenger Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Passenger Information
                  </Typography>
                  <List>
                    {selectedBooking.passengers.map((passenger, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Passenger ${index + 1}`}
                            secondary={
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2">
                                    Name: {passenger.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    Age: {passenger.age}
                                  </Typography>
                                  <Typography variant="body2">
                                    Gender: {passenger.gender}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2">
                                    ID Type: {passenger.idType}
                                  </Typography>
                                  <Typography variant="body2">
                                    ID Number: {passenger.idNumber}
                                  </Typography>
                                  <Typography variant="body2">
                                    Seat: {selectedBooking.seats[index]}
                                  </Typography>
                                </Grid>
                              </Grid>
                            }
                          />
                        </ListItem>
                        {index < selectedBooking.passengers.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Booking Details */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Booking Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        Booking ID: {selectedBooking._id}
                      </Typography>
                      <Typography variant="body2">
                        Booking Date: {formatDate(selectedBooking.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        Payment Method: {selectedBooking.payment.method}
                      </Typography>
                      <Typography variant="body2">
                        Payment Status: {selectedBooking.payment.status}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default BookingDetails; 