import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  getTrains,
  addTrain,
  updateTrain,
  deleteTrain,
  getBookings,
  updateBookingStatus,
  getUsers,
  updateUserRole,
} from '../store/slices/adminSlice';

const trainValidationSchema = Yup.object({
  trainNumber: Yup.string()
    .matches(/^[A-Z0-9]+$/, 'Train number must contain only uppercase letters and numbers')
    .required('Train number is required'),
  name: Yup.string().required('Train name is required'),
  type: Yup.string().required('Train type is required'),
  source: Yup.string().required('Source is required'),
  destination: Yup.string().required('Destination is required'),
  departureTime: Yup.string().required('Departure time is required'),
  arrivalTime: Yup.string().required('Arrival time is required'),
  fare: Yup.number()
    .positive('Fare must be positive')
    .required('Fare is required'),
});

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { trains, bookings, users, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getTrains());
    dispatch(getBookings());
    dispatch(getUsers());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType(null);
    setSelectedItem(null);
  };

  const handleSubmit = async (values) => {
    switch (dialogType) {
      case 'addTrain':
        await dispatch(addTrain(values));
        break;
      case 'editTrain':
        await dispatch(updateTrain({ id: selectedItem._id, ...values }));
        break;
      case 'updateBooking':
        await dispatch(updateBookingStatus({ id: selectedItem._id, status: values.status }));
        break;
      case 'updateUser':
        await dispatch(updateUserRole({ id: selectedItem._id, role: values.role }));
        break;
      default:
        break;
    }
    handleCloseDialog();
  };

  const formik = useFormik({
    initialValues: selectedItem || {
      trainNumber: '',
      name: '',
      type: '',
      source: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      fare: '',
      status: '',
      role: '',
    },
    validationSchema: trainValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Trains" />
            <Tab label="Bookings" />
            <Tab label="Users" />
          </Tabs>
        </Paper>

        {/* Trains Tab */}
        {activeTab === 0 && (
          <Paper>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('addTrain')}
              >
                Add Train
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Train Number</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Fare</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trains.map((train) => (
                    <TableRow key={train._id}>
                      <TableCell>{train.trainNumber}</TableCell>
                      <TableCell>{train.name}</TableCell>
                      <TableCell>{train.type}</TableCell>
                      <TableCell>{train.source}</TableCell>
                      <TableCell>{train.destination}</TableCell>
                      <TableCell>
                        {train.departureTime} - {train.arrivalTime}
                      </TableCell>
                      <TableCell>₹{train.fare}</TableCell>
                      <TableCell>
                        <Chip
                          label={train.status}
                          color={train.status === 'Active' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog('editTrain', train)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => dispatch(deleteTrain(train._id))}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Bookings Tab */}
        {activeTab === 1 && (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Train</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Passengers</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking._id}</TableCell>
                      <TableCell>{booking.train.name}</TableCell>
                      <TableCell>{booking.user.name}</TableCell>
                      <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                      <TableCell>{booking.passengers.length}</TableCell>
                      <TableCell>₹{booking.totalAmount}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={
                            booking.status === 'Confirmed'
                              ? 'success'
                              : booking.status === 'Pending'
                              ? 'warning'
                              : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog('updateBooking', booking)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton>
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Users Tab */}
        {activeTab === 2 && (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog('updateUser', user)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Dialog for Add/Edit Train */}
        <Dialog open={openDialog && dialogType.includes('Train')} onClose={handleCloseDialog}>
          <DialogTitle>
            {dialogType === 'addTrain' ? 'Add New Train' : 'Edit Train'}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="trainNumber"
                    label="Train Number"
                    value={formik.values.trainNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.trainNumber && Boolean(formik.errors.trainNumber)}
                    helperText={formik.touched.trainNumber && formik.errors.trainNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Train Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Train Type</InputLabel>
                    <Select
                      name="type"
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Train Type"
                    >
                      <MenuItem value="Express">Express</MenuItem>
                      <MenuItem value="Superfast">Superfast</MenuItem>
                      <MenuItem value="Local">Local</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="source"
                    label="Source"
                    value={formik.values.source}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.source && Boolean(formik.errors.source)}
                    helperText={formik.touched.source && formik.errors.source}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="destination"
                    label="Destination"
                    value={formik.values.destination}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.destination && Boolean(formik.errors.destination)}
                    helperText={formik.touched.destination && formik.errors.destination}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="departureTime"
                    label="Departure Time"
                    type="time"
                    value={formik.values.departureTime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.departureTime && Boolean(formik.errors.departureTime)}
                    helperText={formik.touched.departureTime && formik.errors.departureTime}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="arrivalTime"
                    label="Arrival Time"
                    type="time"
                    value={formik.values.arrivalTime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.arrivalTime && Boolean(formik.errors.arrivalTime)}
                    helperText={formik.touched.arrivalTime && formik.errors.arrivalTime}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="fare"
                    label="Fare"
                    type="number"
                    value={formik.values.fare}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fare && Boolean(formik.errors.fare)}
                    helperText={formik.touched.fare && formik.errors.fare}
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={formik.handleSubmit} variant="contained">
              {dialogType === 'addTrain' ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for Update Booking Status */}
        <Dialog open={openDialog && dialogType === 'updateBooking'} onClose={handleCloseDialog}>
          <DialogTitle>Update Booking Status</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Status"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={formik.handleSubmit} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for Update User Role */}
        <Dialog open={openDialog && dialogType === 'updateUser'} onClose={handleCloseDialog}>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={formik.handleSubmit} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 