export const getToken = () => localStorage.getItem('expertToken');
export const setToken = (token) => localStorage.setItem('expertToken', token);
export const removeToken = () => localStorage.removeItem('expertToken');
export const isAuthenticated = () => !!getToken();
