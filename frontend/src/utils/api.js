const getApiUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}/api${path}`;
};

export default getApiUrl;
