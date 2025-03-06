const { openDB } = require('idb');

class OfflineService {
  constructor() {
    this.dbName = 'trainBookingDB';
    this.version = 1;
    this.db = null;
  }

  // Initialize IndexedDB
  async initializeDB() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains('users')) {
            db.createObjectStore('users', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('trains')) {
            db.createObjectStore('trains', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('bookings')) {
            db.createObjectStore('bookings', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('recommendations')) {
            db.createObjectStore('recommendations', { keyPath: 'userId' });
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          }
        }
      });
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
      throw error;
    }
  }

  // User operations
  async saveUser(user) {
    try {
      await this.db.put('users', user);
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  }

  async getUser(userId) {
    try {
      return await this.db.get('users', userId);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Train operations
  async saveTrains(trains) {
    try {
      const tx = this.db.transaction('trains', 'readwrite');
      const store = tx.objectStore('trains');
      
      for (const train of trains) {
        await store.put(train);
      }
      
      await tx.done;
      return true;
    } catch (error) {
      console.error('Error saving trains:', error);
      return false;
    }
  }

  async getTrains() {
    try {
      return await this.db.getAll('trains');
    } catch (error) {
      console.error('Error getting trains:', error);
      return [];
    }
  }

  async getTrain(trainId) {
    try {
      return await this.db.get('trains', trainId);
    } catch (error) {
      console.error('Error getting train:', error);
      return null;
    }
  }

  // Booking operations
  async saveBooking(booking) {
    try {
      await this.db.put('bookings', booking);
      return true;
    } catch (error) {
      console.error('Error saving booking:', error);
      return false;
    }
  }

  async getBookings() {
    try {
      return await this.db.getAll('bookings');
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  }

  async getBooking(bookingId) {
    try {
      return await this.db.get('bookings', bookingId);
    } catch (error) {
      console.error('Error getting booking:', error);
      return null;
    }
  }

  // Recommendation operations
  async saveRecommendations(userId, recommendations) {
    try {
      await this.db.put('recommendations', {
        userId,
        recommendations,
        lastUpdated: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error saving recommendations:', error);
      return false;
    }
  }

  async getRecommendations(userId) {
    try {
      const data = await this.db.get('recommendations', userId);
      return data ? data.recommendations : [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // Sync queue operations
  async addToSyncQueue(operation) {
    try {
      await this.db.add('syncQueue', {
        operation,
        timestamp: new Date(),
        status: 'pending'
      });
      return true;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      return false;
    }
  }

  async getSyncQueue() {
    try {
      return await this.db.getAll('syncQueue');
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  async updateSyncStatus(id, status) {
    try {
      const item = await this.db.get('syncQueue', id);
      if (item) {
        item.status = status;
        await this.db.put('syncQueue', item);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating sync status:', error);
      return false;
    }
  }

  async removeFromSyncQueue(id) {
    try {
      await this.db.delete('syncQueue', id);
      return true;
    } catch (error) {
      console.error('Error removing from sync queue:', error);
      return false;
    }
  }

  // Data synchronization
  async syncData() {
    try {
      const syncQueue = await this.getSyncQueue();
      const pendingOperations = syncQueue.filter(item => item.status === 'pending');

      for (const operation of pendingOperations) {
        try {
          // Process the operation based on its type
          switch (operation.operation.type) {
            case 'CREATE_BOOKING':
              await this.processBookingCreation(operation.operation.data);
              break;
            case 'UPDATE_BOOKING':
              await this.processBookingUpdate(operation.operation.data);
              break;
            case 'DELETE_BOOKING':
              await this.processBookingDeletion(operation.operation.data);
              break;
            case 'UPDATE_USER_PREFERENCES':
              await this.processUserPreferencesUpdate(operation.operation.data);
              break;
          }

          // Mark operation as completed
          await this.updateSyncStatus(operation.id, 'completed');
          await this.removeFromSyncQueue(operation.id);
        } catch (error) {
          console.error(`Error processing sync operation ${operation.id}:`, error);
          await this.updateSyncStatus(operation.id, 'failed');
        }
      }

      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      return false;
    }
  }

  // Process sync operations
  async processBookingCreation(data) {
    // Implementation for booking creation
    // This would typically involve making an API call to the server
    console.log('Processing booking creation:', data);
  }

  async processBookingUpdate(data) {
    // Implementation for booking update
    console.log('Processing booking update:', data);
  }

  async processBookingDeletion(data) {
    // Implementation for booking deletion
    console.log('Processing booking deletion:', data);
  }

  async processUserPreferencesUpdate(data) {
    // Implementation for user preferences update
    console.log('Processing user preferences update:', data);
  }

  // Clear all offline data
  async clearOfflineData() {
    try {
      const stores = ['users', 'trains', 'bookings', 'recommendations', 'syncQueue'];
      const tx = this.db.transaction(stores, 'readwrite');
      
      for (const storeName of stores) {
        const store = tx.objectStore(storeName);
        await store.clear();
      }
      
      await tx.done;
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  }
}

module.exports = new OfflineService(); 