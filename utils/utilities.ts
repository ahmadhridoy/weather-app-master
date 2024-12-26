export const convertUnixTimeToDate = (time: number): string => {
  const date = new Date(time * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const convertUnixTimeToLocalTime = (
  time: number,
  timezone: number
): string => {
  const date = new Date(time * 1000);
  date.setSeconds(date.getSeconds() + timezone);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'UTC',
  });
};

export const convertUnixTimeToHour = (time: number): string => {
  const date = new Date(time * 1000);
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    timeZone: 'UTC',
  });
};

export const convertUnixTimeToDay = (time: number): string => {
  const date = new Date(time * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const kelvinToCelsius = (temp: number): number => {
  return temp - 273.15;
};

export const kelvinToFahrenheit = (temp: number): number => {
  return ((temp - 273.15) * 9) / 5 + 32;
};
