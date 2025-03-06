import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Card,
  CardContent,
  CardActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Train as TrainIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { searchTrains } from '../store/slices/trainSlice';

const validationSchema = Yup.object({
  source: Yup.string().required('Source is required'),
  destination: Yup.string().required('Destination is required'),
  date: Yup.date().required('Date is required').min(new Date(), 'Date cannot be in the past'),
  passengers: Yup.number()
    .required('Number of passengers is required')
    .min(1, 'Minimum 1 passenger')
    .max(6, 'Maximum 6 passengers'),
});

const SearchTrains = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trains, loading, error } = useSelector((state) => state.train);
  const [sortBy, setSortBy] = useState('departureTime');
  const [filterBy, setFilterBy] = useState('all');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (trains.length > 0) {
      let filteredTrains = [...trains];

      // Apply filters
      if (filterBy !== 'all') {
        filteredTrains = filteredTrains.filter((train) => {
          switch (filterBy) {
            case 'ac':
              return train.type === 'AC';
            case 'sleeper':
              return train.type === 'Sleeper';
            case 'express':
              return train.type === 'Express';
            default:
              return true;
          }
        });
      }

      // Apply sorting
      filteredTrains.sort((a, b) => {
        switch (sortBy) {
          case 'departureTime':
            return a.departureTime.localeCompare(b.departureTime);
          case 'arrivalTime':
            return a.arrivalTime.localeCompare(b.arrivalTime);
          case 'fare':
            return a.fare - b.fare;
          default:
            return 0;
        }
      });

      setSearchResults(filteredTrains);
    }
  }, [trains, sortBy, filterBy]);

  const handleSearch = async (values) => {
    await dispatch(searchTrains(values));
  };

  const handleBookNow = (trainId) => {
    navigate('/new-booking', {
      state: {
        trainId,
        date: values.date,
        passengers: values.passengers,
      },
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Search Trains
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Formik
            initialValues={{
              source: '',
              destination: '',
              date: new Date(),
              passengers: 1,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSearch}
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Source</InputLabel>
                      <Select
                        name="source"
                        value={values.source}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.source && Boolean(errors.source)}
                      >
                        <MenuItem value="delhi">Delhi</MenuItem>
                        <MenuItem value="mumbai">Mumbai</MenuItem>
                        <MenuItem value="bangalore">Bangalore</MenuItem>
                        <MenuItem value="chennai">Chennai</MenuItem>
                        <MenuItem value="kolkata">Kolkata</MenuItem>
                      </Select>
                      {touched.source && errors.source && (
                        <Typography color="error" variant="caption">
                          {errors.source}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Destination</InputLabel>
                      <Select
                        name="destination"
                        value={values.destination}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.destination && Boolean(errors.destination)}
                      >
                        <MenuItem value="delhi">Delhi</MenuItem>
                        <MenuItem value="mumbai">Mumbai</MenuItem>
                        <MenuItem value="bangalore">Bangalore</MenuItem>
                        <MenuItem value="chennai">Chennai</MenuItem>
                        <MenuItem value="kolkata">Kolkata</MenuItem>
                      </Select>
                      {touched.destination && errors.destination && (
                        <Typography color="error" variant="caption">
                          {errors.destination}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date"
                        value={values.date}
                        onChange={(date) => setFieldValue('date', date)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={touched.date && Boolean(errors.date)}
                            helperText={touched.date && errors.date}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      name="passengers"
                      label="Number of Passengers"
                      type="number"
                      value={values.passengers}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.passengers && Boolean(errors.passengers)}
                      helperText={touched.passengers && errors.passengers}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SearchIcon />}
                      fullWidth
                    >
                      Search Trains
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>

        {trains.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Available Trains
              </Typography>
              <Box>
                <Tooltip title="Sort by">
                  <IconButton onClick={() => setSortBy(sortBy === 'departureTime' ? 'arrivalTime' : 'departureTime')}>
                    <SortIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Filter by">
                  <IconButton onClick={() => setFilterBy(filterBy === 'all' ? 'ac' : 'all')}>
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {searchResults.map((train) => (
                <Grid item xs={12} key={train._id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrainIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">
                              {train.name}
                            </Typography>
                          </Box>
                          <Typography color="textSecondary">
                            Train Number: {train.trainNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationIcon sx={{ mr: 1 }} />
                            <Typography>
                              {train.source} → {train.destination}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon sx={{ mr: 1 }} />
                            <Typography>
                              {train.departureTime} - {train.arrivalTime}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <MoneyIcon sx={{ mr: 1 }} />
                            <Typography variant="h6" color="primary">
                              ₹{train.fare}
                            </Typography>
                          </Box>
                          <Chip
                            label={train.type}
                            color={train.type === 'AC' ? 'primary' : 'default'}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        onClick={() => handleBookNow(train._id)}
                      >
                        Book Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default SearchTrains; 