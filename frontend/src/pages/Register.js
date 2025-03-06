import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { register } from '../store/slices/authSlice';
import { ROUTES } from '../config';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: Yup.string()
    .matches(/^\+?[\d\s-]{10,}$/, 'Invalid phone number')
    .required('Phone number is required'),
  preferredClass: Yup.string()
    .oneOf(['First Class', 'Second Class', 'Third Class', 'Sleeper'])
    .required('Preferred class is required'),
  preferredSeat: Yup.string()
    .oneOf(['Window', 'Aisle', 'Any'])
    .required('Preferred seat is required'),
  preferredTime: Yup.string()
    .oneOf(['Morning', 'Afternoon', 'Evening', 'Night', 'Any'])
    .required('Preferred time is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      preferredClass: 'Second Class',
      preferredSeat: 'Any',
      preferredTime: 'Any',
    },
    validationSchema,
    onSubmit: async (values) => {
      const { confirmPassword, ...registerData } = values;
      const result = await dispatch(register(registerData));
      if (!result.error) {
        navigate(ROUTES.home);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ width: '100%' }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  id="preferredClass"
                  name="preferredClass"
                  label="Preferred Class"
                  value={formik.values.preferredClass}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.preferredClass && Boolean(formik.errors.preferredClass)}
                  helperText={formik.touched.preferredClass && formik.errors.preferredClass}
                  disabled={loading}
                >
                  <MenuItem value="First Class">First Class</MenuItem>
                  <MenuItem value="Second Class">Second Class</MenuItem>
                  <MenuItem value="Third Class">Third Class</MenuItem>
                  <MenuItem value="Sleeper">Sleeper</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  id="preferredSeat"
                  name="preferredSeat"
                  label="Preferred Seat"
                  value={formik.values.preferredSeat}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.preferredSeat && Boolean(formik.errors.preferredSeat)}
                  helperText={formik.touched.preferredSeat && formik.errors.preferredSeat}
                  disabled={loading}
                >
                  <MenuItem value="Window">Window</MenuItem>
                  <MenuItem value="Aisle">Aisle</MenuItem>
                  <MenuItem value="Any">Any</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  id="preferredTime"
                  name="preferredTime"
                  label="Preferred Time"
                  value={formik.values.preferredTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.preferredTime && Boolean(formik.errors.preferredTime)}
                  helperText={formik.touched.preferredTime && formik.errors.preferredTime}
                  disabled={loading}
                >
                  <MenuItem value="Morning">Morning</MenuItem>
                  <MenuItem value="Afternoon">Afternoon</MenuItem>
                  <MenuItem value="Evening">Evening</MenuItem>
                  <MenuItem value="Night">Night</MenuItem>
                  <MenuItem value="Any">Any</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to={ROUTES.login}
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 