import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Switch,
  Avatar,
  IconButton,
  Divider,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Train as TrainIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { updateProfile } from '../store/slices/authSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  preferredClass: Yup.string().required('Preferred class is required'),
  preferredSeat: Yup.string().required('Preferred seat is required'),
  preferredTime: Yup.string().required('Preferred time is required'),
  notifications: Yup.object({
    email: Yup.boolean(),
    sms: Yup.boolean(),
    bookingConfirmation: Yup.boolean(),
    bookingReminder: Yup.boolean(),
    specialOffers: Yup.boolean(),
  }),
});

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('preferredClass', values.preferredClass);
      formData.append('preferredSeat', values.preferredSeat);
      formData.append('preferredTime', values.preferredTime);
      formData.append('notifications', JSON.stringify(values.notifications));
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await dispatch(updateProfile(formData));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>

        <Formik
          initialValues={{
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            preferredClass: user?.preferredClass || 'AC First Class',
            preferredSeat: user?.preferredSeat || 'Window',
            preferredTime: user?.preferredTime || 'Morning',
            notifications: user?.notifications || {
              email: true,
              sms: true,
              bookingConfirmation: true,
              bookingReminder: true,
              specialOffers: false,
            },
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={profileImage || user?.profileImage}
                        sx={{ width: 150, height: 150, mb: 2 }}
                      />
                      {isEditing && (
                        <IconButton
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.dark' },
                          }}
                        >
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <PhotoCameraIcon sx={{ color: 'white' }} />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {values.name}
                    </Typography>
                    <Typography color="textSecondary">
                      {values.email}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6">
                        Personal Information
                      </Typography>
                      <Button
                        startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? 'contained' : 'outlined'}
                      >
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                      </Button>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="name"
                          label="Full Name"
                          value={values.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          disabled={!isEditing}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="email"
                          label="Email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          disabled={!isEditing}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="phone"
                          label="Phone Number"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.phone && Boolean(errors.phone)}
                          helperText={touched.phone && errors.phone}
                          disabled={!isEditing}
                        />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                      Travel Preferences
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          name="preferredClass"
                          label="Preferred Class"
                          value={values.preferredClass}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.preferredClass && Boolean(errors.preferredClass)}
                          helperText={touched.preferredClass && errors.preferredClass}
                          disabled={!isEditing}
                        >
                          <MenuItem value="AC First Class">AC First Class</MenuItem>
                          <MenuItem value="AC Second Class">AC Second Class</MenuItem>
                          <MenuItem value="AC Third Class">AC Third Class</MenuItem>
                          <MenuItem value="Sleeper Class">Sleeper Class</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          name="preferredSeat"
                          label="Preferred Seat"
                          value={values.preferredSeat}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.preferredSeat && Boolean(errors.preferredSeat)}
                          helperText={touched.preferredSeat && errors.preferredSeat}
                          disabled={!isEditing}
                        >
                          <MenuItem value="Window">Window</MenuItem>
                          <MenuItem value="Aisle">Aisle</MenuItem>
                          <MenuItem value="Middle">Middle</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          name="preferredTime"
                          label="Preferred Time"
                          value={values.preferredTime}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.preferredTime && Boolean(errors.preferredTime)}
                          helperText={touched.preferredTime && errors.preferredTime}
                          disabled={!isEditing}
                        >
                          <MenuItem value="Morning">Morning</MenuItem>
                          <MenuItem value="Afternoon">Afternoon</MenuItem>
                          <MenuItem value="Evening">Evening</MenuItem>
                          <MenuItem value="Night">Night</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                      Notification Preferences
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="notifications.email"
                              checked={values.notifications.email}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          }
                          label="Email Notifications"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="notifications.sms"
                              checked={values.notifications.sms}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          }
                          label="SMS Notifications"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="notifications.bookingConfirmation"
                              checked={values.notifications.bookingConfirmation}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          }
                          label="Booking Confirmation"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="notifications.bookingReminder"
                              checked={values.notifications.bookingReminder}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          }
                          label="Booking Reminders"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="notifications.specialOffers"
                              checked={values.notifications.specialOffers}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          }
                          label="Special Offers"
                        />
                      </Grid>
                    </Grid>

                    {isEditing && (
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={isSubmitting}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default Profile; 