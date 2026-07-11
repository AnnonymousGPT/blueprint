export const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://blueprint-backend-msrn.onrender.com';

async function fetchWithAuth(url, token, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${res.status}`);
  }
  
  return await res.json();
}

export const api = {
  sendOtp: async (phone) => {
    return await fetchWithAuth('/api/auth/send-otp', null, {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },
  
  verifyOtp: async (phone, otp) => {
    return await fetchWithAuth('/api/auth/verify-otp', null, {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
  },

  register: async (registerData) => {
    return await fetchWithAuth('/api/auth/register', null, {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
  },

  getMe: async (token) => {
    return await fetchWithAuth('/api/auth/me', token);
  },

  getRequests: async (token) => {
    return await fetchWithAuth('/api/requests', token);
  },

  getBookings: async (token) => {
    // Note: If you want to fetch bookings you might need a /api/bookings GET endpoint
    // For now we'll simulate fetching from requests or just returning empty array
    // Since getRequests includes bookings, you can extract them there.
    return { success: true, data: [] };
  },

  createBooking: async (token, bookingData) => {
    return await fetchWithAuth('/api/bookings', token, {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  updateRequest: async (token, reqId, data) => {
    return await fetchWithAuth(`/api/requests/${reqId}`, token, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  getMessages: async (token, otherUserId) => {
    return await fetchWithAuth(`/api/messages/${otherUserId}`, token);
  },

  sendMessage: async (token, receiverId, content) => {
    return await fetchWithAuth('/api/messages', token, {
      method: 'POST',
      body: JSON.stringify({ receiverId, content })
    });
  },

  getNotifications: async (token) => {
    return await fetchWithAuth('/api/notifications', token);
  },

  markNotificationsAllRead: async (token) => {
    return await fetchWithAuth('/api/notifications/read-all', token, {
      method: 'POST'
    });
  },

  markNotificationRead: async (token, id) => {
    return await fetchWithAuth(`/api/notifications/${id}/read`, token, {
      method: 'PATCH'
    });
  }
};
