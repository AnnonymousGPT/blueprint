import axios from 'axios';

export const mockUserProfile = null;
export const mockExperts = [];
export const initialRequests = [];
export const initialDocuments = [];

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://blueprint-backend-msrn.onrender.com/api';

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Intercept 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token available, logout/clear and reject
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth_session_expired'));
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Request a new access token
        const res = await axios.post(`${BACKEND_URL}/auth/refresh-token`, { refreshToken });
        const newToken = res.data.token;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh token is invalid/expired, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth_session_expired'));
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  sendOtp: async (phone) => {
    try {
      const response = await apiClient.post('/auth/send-otp', { phone });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP';
      throw new Error(msg);
    }
  },

  verifyOtp: async (phone, otp) => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { phone, otp });
      const data = response.data;
      if (data.token || data.accessToken) {
        localStorage.setItem('accessToken', data.token || data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to verify OTP';
      throw new Error(msg);
    }
  },

  register: async (registerData) => {
    try {
      const response = await apiClient.post('/auth/register', registerData);
      const data = response.data;
      if (data.token || data.accessToken) {
        localStorage.setItem('accessToken', data.token || data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      throw new Error(msg);
    }
  },

  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user;
    } catch (err) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  },

  getRequests: async () => {
    try {
      const response = await apiClient.get('/requests');
      return { success: true, requests: response.data.data };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to fetch requests');
    }
  },

  createRequest: async (serviceName, expertId, amount) => {
    try {
      const response = await apiClient.post('/requests', {
        serviceName,
        assignedExpertId: expertId,
        amount
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create request');
    }
  },

  getExperts: async () => {
    try {
      const response = await apiClient.get('/experts');
      return response.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to fetch experts');
    }
  },

  bookAppointment: async (expert, date, slot, type, requestId) => {
    try {
      const response = await apiClient.post('/bookings', {
        expertId: expert.id,
        requestId,
        date,
        time: slot,
        type: type === 'Video Call' ? 'VIDEO' : type === 'Phone Call' ? 'PHONE' : 'CHAT'
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to book appointment');
    }
  },

  processPayment: async (amount, method, requestId) => {
    return {
      success: true,
      transactionId: "TXN-" + Math.floor(100000000 + Math.random() * 900000000)
    };
  },

  uploadDocument: async (file, category, requestId) => {
    const safeRequestId = (requestId && !requestId.startsWith('550e8400')) ? requestId : undefined;
    const fileName = file.name || `${category}_doc.pdf`;
    
    try {
      // Step 1: Request signed upload URL from backend
      const urlResponse = await apiClient.get(
        `/documents/upload-url?fileName=${encodeURIComponent(fileName)}&category=${encodeURIComponent(category)}`
      );
      
      const { signedUrl, storagePath } = urlResponse.data;
      
      // Step 2: Upload file directly to Supabase Storage using the signed URL
      // Use direct axios for binary upload to avoid passing bearer token
      await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      });
      
      // Step 3: Confirm upload with backend
      const response = await apiClient.post('/documents/confirm', {
        storagePath,
        fileName,
        category: category.toUpperCase().replace(/\s+/g, '_'),
        size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
        requestId: safeRequestId
      });
      
      return { success: true, document: response.data.data };
    } catch (storageErr) {
      console.warn('Supabase Storage signed upload failed, falling back to metadata-only:', storageErr);
      // Fallback: metadata-only upload
      try {
        const response = await apiClient.post('/documents/upload', {
          name: fileName,
          category: category.toUpperCase().replace(/\s+/g, '_'),
          size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
          requestId: safeRequestId
        });
        return { success: true, document: response.data.data };
      } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to upload document');
      }
    }
  },

  getMessages: async (otherUserId) => {
    try {
      const response = await apiClient.get(`/messages/${otherUserId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to fetch messages');
    }
  },

  sendMessage: async (receiverId, content) => {
    try {
      const response = await apiClient.post('/messages', { receiverId, content });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to send message');
    }
  },

  updateRequestStatus: async (requestId, status, progressPercent) => {
    try {
      const response = await apiClient.patch(`/requests/${requestId}`, { status, progressPercent });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update request status');
    }
  },

  updateDocumentStatus: async (docId, status) => {
    try {
      const response = await apiClient.patch(`/documents/${docId}`, { status });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update document status');
    }
  },

  updateProfile: async (name, email, pan, gst) => {
    try {
      const response = await apiClient.patch('/auth/profile', { name, email, pan, gst });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update profile');
    }
  },

  deleteAccount: async () => {
    try {
      const response = await apiClient.delete('/auth/account');
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete account');
    }
  }
};
