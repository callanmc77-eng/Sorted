const env = {
  TFI_API_KEY: import.meta.env.VITE_TFI_API_KEY as string,
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  PUSH_SERVER_URL: import.meta.env.VITE_PUSH_SERVER_URL as string,
  VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY as string,
};

export default env;
