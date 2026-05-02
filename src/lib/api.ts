export const getApiUrl = () => {
  const origin = window.location.origin;
  const isVercel = origin.includes('vercel.app');
  
  if (isVercel) {
    return 'https://ais-pre-g2juvihdzewqfrd42vfmaw-754701656249.europe-west2.run.app';
  }
  
  // If we are on the Cloud Run URL itself, use relative paths
  return '';
};
export const API_URL = getApiUrl();
