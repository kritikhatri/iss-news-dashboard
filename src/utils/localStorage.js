// localStorage.js

export const setCache = (key, data, expiryInMinutes = 15) => {
  const now = new Date();
  const item = {
    data: data,
    expiry: now.getTime() + expiryInMinutes * 60 * 1000,
  };
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error("Error setting cache", error);
  }
};

export const getCache = (key) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (error) {
    console.error("Error getting cache", error);
    return null;
  }
};
