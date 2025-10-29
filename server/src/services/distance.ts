import axios from 'axios';

export const getDistanceMiles = async (origin: string, destination: string): Promise<number> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set. Returning default distance.');
    return 10;
  }

  const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
    params: {
      origins: origin,
      destinations: destination,
      key: apiKey,
      units: 'imperial'
    }
  });

  const element = response.data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== 'OK') {
    throw new Error('Distance lookup failed. Confirm the addresses.');
  }
  const miles = element.distance.value / 1609.34;
  return Math.round(miles * 100) / 100;
};
