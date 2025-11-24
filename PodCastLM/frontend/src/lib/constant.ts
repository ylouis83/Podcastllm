const LOCAL_HOST = "http://localhost:8000";

const DEFAULT_HOST_URL = import.meta.env.VITE_HOST_URL
  || (import.meta.env.DEV ? LOCAL_HOST : "https://zhang-xxx-podcastlm-backend.hf.space");

export const HOST_URL = DEFAULT_HOST_URL;
export const BASE_URL = import.meta.env.VITE_BASE_URL || `${HOST_URL}/api/v1/chat`;
