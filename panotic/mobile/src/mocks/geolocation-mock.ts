export const requestAuthorization = async () => 'granted';
export const getCurrentPosition = (success: any, error?: any) => {
  success({
    coords: {
      latitude: 6.3653,
      longitude: 2.4183,
      accuracy: 10,
      altitude: 0,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  });
};

export default {
  requestAuthorization,
  getCurrentPosition,
};
