const API_URL = 'http://localhost:5000/api/v1';

export const fetchCourses = async () => {
  try {
    const response = await fetch(`${API_URL}/courses`);
    const data = await response.json();
    if (data.success) {
      return data.data; // Standardized API response format
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

export const fetchCourseById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/courses/${id}`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message);
  } catch (error) {
    throw error;
  }
};
