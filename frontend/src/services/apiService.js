export const mockUserProfile = null;
export const mockExperts = [];
export const initialRequests = [];
export const initialDocuments = [];

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://blueprint-backend-msrn.onrender.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  sendOtp: async (phone) => {
    const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send OTP');
    }
    return await response.json();
  },

  verifyOtp: async (phone, otp) => {
    const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to verify OTP');
    }
    const data = await response.json();
    if (data.token || data.accessToken) {
      localStorage.setItem('accessToken', data.token || data.accessToken);
    }
    return data;
  },

  register: async (registerData) => {
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await response.json();
    if (data.token || data.accessToken) {
      localStorage.setItem('accessToken', data.token || data.accessToken);
    }
    return data;
  },

  getMe: async () => {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      localStorage.removeItem('accessToken');
      return null;
    }
    const data = await response.json();
    return data.user;
  },

  getRequests: async () => {
    const response = await fetch(`${BACKEND_URL}/requests`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch requests');
    }
    const data = await response.json();
    return { success: true, requests: data.data };
  },

  createRequest: async (serviceName, expertId, amount) => {
    const response = await fetch(`${BACKEND_URL}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        serviceName,
        assignedExpertId: expertId,
        amount
      })
    });
    if (!response.ok) throw new Error('Failed to create request');
    return await response.json();
  },

  getExperts: async () => {
    const response = await fetch(`${BACKEND_URL}/experts`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch experts');
    const data = await response.json();
    return data.data;
  },

  bookAppointment: async (expert, date, slot, type, requestId) => {
    const response = await fetch(`${BACKEND_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        expertId: expert.id,
        requestId,
        date,
        time: slot,
        type: type === 'Video Call' ? 'VIDEO' : type === 'Phone Call' ? 'PHONE' : 'CHAT'
      })
    });
    if (!response.ok) throw new Error('Failed to book appointment');
    return await response.json();
  },

  processPayment: async (amount, method, requestId) => {
    // Payment process skipped/mocked for now since backend payment controller is deleted
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
      const urlResponse = await fetch(
        `${BACKEND_URL}/documents/upload-url?fileName=${encodeURIComponent(fileName)}&category=${encodeURIComponent(category)}`,
        {
          headers: getHeaders()
        }
      );
      
      if (!urlResponse.ok) {
        throw new Error('Failed to get signed upload URL from backend');
      }
      
      const { signedUrl, storagePath } = await urlResponse.json();
      
      // Step 2: Upload file directly to Supabase Storage using the signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage bucket');
      }
      
      // Step 3: Confirm upload with backend
      const response = await fetch(`${BACKEND_URL}/documents/confirm`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          storagePath,
          fileName,
          category: category.toUpperCase().replace(/\s+/g, '_'),
          size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
          requestId: safeRequestId
        })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to confirm upload');
      }
      
      const uploadData = await response.json();
      return { success: true, document: uploadData.data };
    } catch (storageErr) {
      console.warn('Supabase Storage signed upload failed, falling back to metadata-only:', storageErr);
      // Fallback: metadata-only upload
      const response = await fetch(`${BACKEND_URL}/documents/upload`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: fileName,
          category: category.toUpperCase().replace(/\s+/g, '_'),
          size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
          requestId: safeRequestId
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to upload document');
      }
      const uploadData = await response.json();
      return { success: true, document: uploadData.data };
    }
  },

  getMessages: async (otherUserId) => {
    const response = await fetch(`${BACKEND_URL}/messages/${otherUserId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  },

  sendMessage: async (receiverId, content) => {
    const response = await fetch(`${BACKEND_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ receiverId, content })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  }
};
