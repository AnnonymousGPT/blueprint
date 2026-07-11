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
    try {
      const res = await api.getRequests(token);
      const reqs = res.data || [];
      const allBookings = [];
      reqs.forEach(req => {
        if (req.bookings && req.bookings.length > 0) {
          req.bookings.forEach(b => {
            allBookings.push({
              ...b,
              clientName: req.client?.name || 'Unknown Client',
              serviceName: req.serviceName
            });
          });
        }
      });
      return { success: true, data: allBookings };
    } catch (e) {
      console.error(e);
      return { success: false, data: [] };
    }
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

  updateDocumentStatus: async (token, docId, status, reason) => {
    return await fetchWithAuth(`/api/documents/${docId}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    });
  },

  getDocumentDownloadUrl: async (token, docId) => {
    return await fetchWithAuth(`/api/documents/${docId}/download`, token);
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
