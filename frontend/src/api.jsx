const API_URL = 'http://localhost:5000/api';

// Authentication API calls
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
};

// Posts API calls
export const getPosts = async (page = 1, limit = 10) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  const response = await fetch(`${API_URL}/posts?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
};

export const createPost = async (content, image = null) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, image }),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
};

export const likePost = async (postId) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  const response = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to like post');
  }

  return response.json();
};

export const addComment = async (postId, text) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to add comment');
  }

  return response.json();
};

// Messages API calls
export const getConversations = async () => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  const response = await fetch(`${API_URL}/messages/conversations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }

  return response.json();
};

export const getMessages = async (conversationId) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  const response = await fetch(`${API_URL}/messages/${conversationId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
};

export const sendMessage = async (messageData) => {
  const token = JSON.parse(localStorage.getItem('user'))?.token;
  
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};
