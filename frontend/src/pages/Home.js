import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSelector } from 'react-redux';
import { APP_CONFIG, ROUTES } from '../config';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: new Date(),
    passengers: 1,
  });
  const [featuredTrains, setFeaturedTrains] = useState([]);

  // Sample stations - In a real app, this would come from an API
  const stations = [
    { value: 'NYC', label: 'New York' },
    { value: 'BOS', label: 'Boston' },
    { value: 'WDC', label: 'Washington DC' },
    { value: 'CHI', label: 'Chicago' },
    { value: 'LAX', label: 'Los Angeles' },
  ];

  useEffect(() => {
    // In a real app, this would fetch featured trains from an API
    const fetchFeaturedTrains = async () => {
      // Simulated API call
      setFeaturedTrains([
        {
          id: 1,
          name: 'Express One',
          type: 'Express',
          source: 'New York',
          destination: 'Boston',
          departureTime: '08:00',
          arrivalTime: '12:00',
          price: 150,
          image: '/images/train1.jpg',
        },
        {
          id: 2,
          name: 'Superfast Two',
          type: 'Superfast',
          source: 'Boston',
          destination: 'Washington DC',
          departureTime: '09:00',
          arrivalTime: '14:00',
          price: 200,
          image: '/images/train2.jpg',
        },
      ]);
    };

    fetchFeaturedTrains();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(ROUTES.search, { state: searchParams });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setSearchParams((prev) => ({
      ...prev,
      date,
    }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        {/* Hero Section */}
        <Paper
          sx={{
            p: 4,
            mb: 6,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            color: 'white',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Book Your Train Journey
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Experience comfortable and convenient travel with our AI-powered booking system
          </Typography>

          {/* Search Form */}
          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              p: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <FormControl fullWidth>
              <InputLabel>From</InputLabel>
              <Select
                name="source"
                value={searchParams.source}
                onChange={handleInputChange}
                label="From"
                required
              >
                {stations.map((station) => (
                  <MenuItem key={station.value} value={station.value}>
                    {station.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>To</InputLabel>
              <Select
                name="destination"
                value={searchParams.destination}
                onChange={handleInputChange}
                label="To"
                required
              >
                {stations.map((station) => (
                  <MenuItem key={station.value} value={station.value}>
                    {station.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={searchParams.date}
                onChange={handleDateChange}
                minDate={new Date()}
                maxDate={new Date(Date.now() + APP_CONFIG.booking.maxAdvanceBooking * 24 * 60 * 60 * 1000)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>

            <TextField
              name="passengers"
              label="Passengers"
              type="number"
              value={searchParams.passengers}
              onChange={handleInputChange}
              inputProps={{ min: 1, max: APP_CONFIG.booking.maxPassengers }}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
            >
              Search Trains
            </Button>
          </Paper>
        </Paper>

        {/* Featured Trains */}
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Trains
        </Typography>
        <Grid container spacing={3}>
          {featuredTrains.map((train) => (
            <Grid item xs={12} sm={6} md={4} key={train.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={train.image}
                  alt={train.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h3">
                    {train.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {train.type}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {train.source} → {train.destination}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Departure: {train.departureTime} | Arrival: {train.arrivalTime}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${train.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`${ROUTES.search}?train=${train.id}`)}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Why Choose Us
          </Typography>
          <Grid container spacing={3}>
            {APP_CONFIG.features.offlineMode && (
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Offline Booking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Book tickets even when you're offline
                  </Typography>
                </Paper>
              </Grid>
            )}
            {APP_CONFIG.features.aiRecommendations && (
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    AI Recommendations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get personalized train suggestions
                  </Typography>
                </Paper>
              </Grid>
            )}
            {APP_CONFIG.features.realTimeUpdates && (
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Real-time Updates
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stay informed about train status
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 