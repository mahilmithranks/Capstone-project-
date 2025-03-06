import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Payment as PaymentIcon,
  Train as TrainIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getTrainDetails, getTrainSeats } from '../store/slices/trainSlice';
import { createBooking, processPayment } from '../store/slices/bookingSlice';
import { saveOffline } from '../store/slices/offlineSlice';

const steps = ['Train Details', 'Passenger Information', 'Payment'];

const passengerSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  age: Yup.number()
    .required('Age is required')
    .min(1, 'Age must be at least 1')
    .max(120, 'Age must be less than 120'),
  gender: Yup.string().required('Gender is required'),
  idType: Yup.string().required('ID type is required'),
  idNumber: Yup.string().required('ID number is required'),
});

const paymentSchema = Yup.object({
  cardNumber: Yup.string()
    .matches(/^[0-9]{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  cardName: Yup.string().required('Cardholder name is required'),
  expiryDate: Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date')
    .required('Expiry date is required'),
  cvv: Yup.string()
    .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits')
    .required('CVV is required'),
});

const NewBooking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedTrain, availableSeats, loading: trainLoading } = useSelector((state) => state.train);
  const { loading: bookingLoading, error } = useSelector((state) => state.booking);
  const { isOnline } = useSelector((state) => state.offline);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [openSeatDialog, setOpenSeatDialog] = useState(false);

  useEffect(() => {
    const trainId = location.state?.trainId;
    if (trainId) {
      dispatch(getTrainDetails(trainId));
      dispatch(getTrainSeats(trainId));
    }
  }, [dispatch, location.state?.trainId]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else if (selectedSeats.length < location.state?.passengers) {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleBookingSubmit = async (values, { setSubmitting }) => {
    try {
      const bookingData = {
        trainId: selectedTrain._id,
        date: location.state?.date,
        passengers: values.passengers,
        selectedSeats,
        totalAmount: selectedTrain.fare * selectedSeats.length,
      };

      const result = await dispatch(createBooking(bookingData));
      if (!result.error) {
        handleNext();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (values, { setSubmitting }) => {
    try {
      const paymentData = {
        bookingId: location.state?.bookingId,
        ...values,
      };

      const result = await dispatch(processPayment(paymentData));
      if (!result.error) {
        navigate('/booking-confirmation', { state: { bookingId: location.state?.bookingId } });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (trainLoading || bookingLoading) {
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

  if (!selectedTrain) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          No train selected. Please go back to search.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Book Your Ticket
        </Typography>

        {!isOnline && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are currently offline. Your booking will be saved and processed when you're back online.
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Train Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrainIcon sx={{ mr: 1 }} />
                    <Typography>
                      {selectedTrain.name} ({selectedTrain.trainNumber})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    <Typography>
                      {selectedTrain.source} → {selectedTrain.destination}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimeIcon sx={{ mr: 1 }} />
                    <Typography>
                      {new Date(location.state?.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 4 }}>
                    Departure: {selectedTrain.departureTime} | Arrival: {selectedTrain.arrivalTime}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography>
                      {location.state?.passengers} Passenger(s)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyIcon sx={{ mr: 1 }} />
                    <Typography>
                      Fare per passenger: ₹{selectedTrain.fare}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Total Amount: ₹{selectedTrain.fare * location.state?.passengers}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={selectedSeats.length !== location.state?.passengers}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <Formik
              initialValues={{
                passengers: Array(location.state?.passengers).fill({
                  name: '',
                  age: '',
                  gender: '',
                  idType: '',
                  idNumber: '',
                }),
              }}
              validationSchema={Yup.object({
                passengers: Yup.array().of(passengerSchema),
              })}
              onSubmit={handleBookingSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                <Form>
                  <Typography variant="h6" gutterBottom>
                    Passenger Information
                  </Typography>
                  <Grid container spacing={3}>
                    {values.passengers.map((passenger, index) => (
                      <Grid item xs={12} key={index}>
                        <Paper sx={{ p: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1">
                              Passenger {index + 1}
                            </Typography>
                            {index > 0 && (
                              <IconButton onClick={() => values.passengers.splice(index, 1)} color="error">
                                <RemoveIcon />
                              </IconButton>
                            )}
                          </Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                name={`passengers.${index}.name`}
                                label="Full Name"
                                value={passenger.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.passengers?.[index]?.name && Boolean(errors.passengers?.[index]?.name)}
                                helperText={touched.passengers?.[index]?.name && errors.passengers?.[index]?.name}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                name={`passengers.${index}.age`}
                                label="Age"
                                type="number"
                                value={passenger.age}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.passengers?.[index]?.age && Boolean(errors.passengers?.[index]?.age)}
                                helperText={touched.passengers?.[index]?.age && errors.passengers?.[index]?.age}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel>Gender</InputLabel>
                                <Select
                                  name={`passengers.${index}.gender`}
                                  value={passenger.gender}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={touched.passengers?.[index]?.gender && Boolean(errors.passengers?.[index]?.gender)}
                                >
                                  <MenuItem value="male">Male</MenuItem>
                                  <MenuItem value="female">Female</MenuItem>
                                  <MenuItem value="other">Other</MenuItem>
                                </Select>
                                {touched.passengers?.[index]?.gender && errors.passengers?.[index]?.gender && (
                                  <Typography color="error" variant="caption">
                                    {errors.passengers[index].gender}
                                  </Typography>
                                )}
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth>
                                <InputLabel>ID Type</InputLabel>
                                <Select
                                  name={`passengers.${index}.idType`}
                                  value={passenger.idType}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={touched.passengers?.[index]?.idType && Boolean(errors.passengers?.[index]?.idType)}
                                >
                                  <MenuItem value="aadhar">Aadhar Card</MenuItem>
                                  <MenuItem value="pan">PAN Card</MenuItem>
                                  <MenuItem value="passport">Passport</MenuItem>
                                  <MenuItem value="driving">Driving License</MenuItem>
                                </Select>
                                {touched.passengers?.[index]?.idType && errors.passengers?.[index]?.idType && (
                                  <Typography color="error" variant="caption">
                                    {errors.passengers[index].idType}
                                  </Typography>
                                )}
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                name={`passengers.${index}.idNumber`}
                                label="ID Number"
                                value={passenger.idNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.passengers?.[index]?.idNumber && Boolean(errors.passengers?.[index]?.idNumber)}
                                helperText={touched.passengers?.[index]?.idNumber && errors.passengers?.[index]?.idNumber}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => values.passengers.push({ name: '', age: '', gender: '', idType: '', idNumber: '' })}
                          disabled={values.passengers.length >= location.state?.passengers}
                        >
                          Add Passenger
                        </Button>
                        <Box>
                          <Button onClick={handleBack} sx={{ mr: 1 }}>
                            Back
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                          >
                            Next
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          )}

          {activeStep === 2 && (
            <Formik
              initialValues={{
                cardNumber: '',
                cardName: '',
                expiryDate: '',
                cvv: '',
              }}
              validationSchema={paymentSchema}
              onSubmit={handlePaymentSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                <Form>
                  <Typography variant="h6" gutterBottom>
                    Payment Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="cardNumber"
                        label="Card Number"
                        value={values.cardNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.cardNumber && Boolean(errors.cardNumber)}
                        helperText={touched.cardNumber && errors.cardNumber}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="cardName"
                        label="Cardholder Name"
                        value={values.cardName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.cardName && Boolean(errors.cardName)}
                        helperText={touched.cardName && errors.cardName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="expiryDate"
                        label="Expiry Date (MM/YY)"
                        value={values.expiryDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.expiryDate && Boolean(errors.expiryDate)}
                        helperText={touched.expiryDate && errors.expiryDate}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="cvv"
                        label="CVV"
                        type="password"
                        value={values.cvv}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.cvv && Boolean(errors.cvv)}
                        helperText={touched.cvv && errors.cvv}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      Pay ₹{selectedTrain.fare * location.state?.passengers}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          )}
        </Paper>
      </Box>

      <Dialog open={openSeatDialog} onClose={() => setOpenSeatDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Seats</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {Array.from({ length: 40 }, (_, i) => i + 1).map((seat) => (
              <Grid item xs={3} key={seat}>
                <Chip
                  label={`Seat ${seat}`}
                  onClick={() => handleSeatSelect(seat)}
                  color={selectedSeats.includes(seat) ? 'primary' : 'default'}
                  disabled={!availableSeats.includes(seat)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSeatDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NewBooking; 