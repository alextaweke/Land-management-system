// api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  // Add timeout for file uploads
  timeout: 60000, // 60 seconds for file uploads
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  
  // Add Authorization header if token exists
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // For FormData requests, let the browser set the Content-Type header
  // This is important for file uploads with multipart/form-data
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.status, error.response.data);
      
      // Handle specific status codes
      switch (error.response.status) {
        case 400:
          console.error("Bad Request:", error.response.data);
          break;
        case 403:
          console.error("Forbidden:", error.response.data);
          break;
        case 404:
          console.error("Not Found:", error.response.data);
          break;
        case 500:
          console.error("Server Error:", error.response.data);
          break;
        default:
          console.error("Unexpected Error:", error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function for file uploads
export const uploadFile = async (url: string, formData: FormData, onProgress?: (progress: number) => void) => {
  return api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

// Helper function for downloading files
export const downloadFile = async (url: string, filename?: string) => {
  const response = await api.get(url, {
    responseType: "blob",
  });
  
  // Create download link
  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename || "download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

export default api;