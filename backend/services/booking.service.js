const Train = require('../models/train.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const offlineService = require('./offline.service');
const aiService = require('./ai.service');

class BookingService {
  // Search for available trains
  async searchTrains(source, destination, date) {
    try {
      // Check offline storage first
      const offlineTrains = await offlineService.getTrains();
      if (offlineTrains.length > 0) {
        return this.filterTrains(offlineTrains, source, destination, date);
      }

      // If no offline data, search in database
      const trains = await Train.searchTrains(source, destination, date);
      
      // Save to offline storage
      await offlineService.saveTrains(trains);

      return trains;
    } catch (error) {
      console.error('Error searching trains:', error);
      throw error;
    }
  }

  // Filter trains based on search criteria
  filterTrains(trains, source, destination, date) {
    return trains.filter(train => {
      const matchesRoute = train.source.code === source && 
                          train.destination.code === destination;
      const matchesDate = new Date(train.schedule[0].departureTime).toDateString() === 
                         new Date(date).toDateString();
      return matchesRoute && matchesDate;
    });
  }

  // Create a new booking
  async createBooking(userId, bookingData) {
    try {
      // Get train details
      const train = await Train.findById(bookingData.trainId);
      if (!train) {
        throw new Error('Train not found');
      }

      // Check seat availability
      const availableSeats = train.getAvailableSeatsByClass(bookingData.class);
      if (availableSeats.length < bookingData.passengers.length) {
        throw new Error('Not enough seats available');
      }

      // Calculate total fare
      const totalFare = train.calculateFare(bookingData.class, bookingData.distance);

      // Create booking
      const booking = new Booking({
        user: userId,
        train: train._id,
        journeyDate: bookingData.journeyDate,
        passengers: bookingData.passengers,
        source: train.source,
        destination: train.destination,
        totalFare,
        payment: {
          amount: totalFare,
          method: bookingData.paymentMethod,
          status: 'Pending'
        },
        isOfflineBooking: !navigator.onLine
      });

      await booking.save();

      // Update seat availability
      for (const passenger of bookingData.passengers) {
        await train.updateSeatStatus(passenger.seatNumber, false);
      }

      // Save to offline storage
      await offlineService.saveBooking({
        id: booking._id,
        ...booking.toObject()
      });

      // Add to sync queue if offline
      if (!navigator.onLine) {
        await offlineService.addToSyncQueue({
          type: 'CREATE_BOOKING',
          data: booking.toObject()
        });
      }

      // Update AI recommendations
      await aiService.trainModel(userId, train._id, 5);

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get user's bookings
  async getUserBookings(userId) {
    try {
      // Check offline storage first
      const offlineBookings = await offlineService.getBookings();
      if (offlineBookings.length > 0) {
        return offlineBookings.filter(booking => booking.user === userId);
      }

      // If no offline data, get from database
      const bookings = await Booking.findByUser(userId);
      
      // Save to offline storage
      await offlineService.saveBookings(bookings);

      return bookings;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(userId, bookingId, reason) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.user.toString() !== userId) {
        throw new Error('Unauthorized to cancel this booking');
      }

      // Cancel booking
      await booking.cancelBooking(reason);

      // Update seat availability
      const train = await Train.findById(booking.train);
      for (const passenger of booking.passengers) {
        await train.updateSeatStatus(passenger.seatNumber, true);
      }

      // Update offline storage
      await offlineService.saveBooking({
        id: booking._id,
        ...booking.toObject()
      });

      // Add to sync queue if offline
      if (!navigator.onLine) {
        await offlineService.addToSyncQueue({
          type: 'UPDATE_BOOKING',
          data: booking.toObject()
        });
      }

      return booking;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  }

  // Get booking details
  async getBookingDetails(bookingId) {
    try {
      // Check offline storage first
      const offlineBooking = await offlineService.getBooking(bookingId);
      if (offlineBooking) {
        return offlineBooking;
      }

      // If no offline data, get from database
      const booking = await Booking.findById(bookingId)
        .populate('train')
        .populate('user', 'name email');

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Save to offline storage
      await offlineService.saveBooking({
        id: booking._id,
        ...booking.toObject()
      });

      return booking;
    } catch (error) {
      console.error('Error getting booking details:', error);
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      booking.status = status;
      await booking.save();

      // Update offline storage
      await offlineService.saveBooking({
        id: booking._id,
        ...booking.toObject()
      });

      // Add to sync queue if offline
      if (!navigator.onLine) {
        await offlineService.addToSyncQueue({
          type: 'UPDATE_BOOKING',
          data: booking.toObject()
        });
      }

      return booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(bookingId, paymentData) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Update payment details
      booking.payment = {
        ...booking.payment,
        ...paymentData,
        status: 'Completed',
        paymentDate: new Date()
      };

      // Update booking status
      booking.status = 'Confirmed';
      await booking.save();

      // Update offline storage
      await offlineService.saveBooking({
        id: booking._id,
        ...booking.toObject()
      });

      // Add to sync queue if offline
      if (!navigator.onLine) {
        await offlineService.addToSyncQueue({
          type: 'UPDATE_BOOKING',
          data: booking.toObject()
        });
      }

      return booking;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Get booking statistics
  async getBookingStatistics() {
    try {
      const stats = await Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalFare: { $sum: '$totalFare' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('Error getting booking statistics:', error);
      throw error;
    }
  }
}

module.exports = new BookingService(); 