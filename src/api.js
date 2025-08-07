const API_BASE = process.env.REACT_APP_API_URL || 'https://hopepaws-api-hfbwhtazhsg4cjbb.centralus-01.azurewebsites.net';

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const apiFetch = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = getAuthToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) options.body = JSON.stringify(body);

  const url = `${API_BASE.replace(/\/$/, '')}/${endpoint.replace(/^\/$/, '')}`;

  console.log(`Making ${method} request to: ${url}`);
  if (body) console.log('Request body:', body);

  const res = await fetch(url, options);
  
  console.log(`Response status: ${res.status}`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log('Error response:', err);
    console.log('Full error details:', {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
      error: err
    });
    throw new Error(err.message || `API error: ${res.status}`);
  }
  return res.json();
};

