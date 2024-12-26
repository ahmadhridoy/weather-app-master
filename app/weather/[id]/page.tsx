'use client';

import { useEffect, useState, FC } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  convertUnixTimeToDate,
  convertUnixTimeToDay,
  convertUnixTimeToHour,
  convertUnixTimeToLocalTime,
  kelvinToCelsius,
  kelvinToFahrenheit,
} from '@/utils/utilities';
import TextLoader from '@/components/Loaders/TextLoader';
import CardLoader from '@/components/Loaders/CardLoader';
import RainingImage from '@/public/assets/raining.webp';
import CloudyImage from '@/public/assets/cloudy.jpg';
import SunnyImage from '@/public/assets/sunny.jpg';

const Weather: FC = () => {
  const APIKey = '2686707cf91b1dd2d3034ec6edf049e0';
  const params = useParams<{ id: string }>();
  const [coordinates, setCoordinates] = useState<{ lat: string; lon: string }>({
    lat: '',
    lon: '',
  });
  const [data, setData] = useState<any>();
  const [hourlyData, setHourlyData] = useState<any[]>();
  const [weeklyData, setWeeklyData] = useState<any[]>();
  const [image, setImage] = useState<
    typeof RainingImage | typeof CloudyImage | typeof SunnyImage | null
  >(null);
  const [inCelsius, setInCelsius] = useState(false);

  const additionalData = [
    {
      label: 'Feels Like',
      value:
        data && inCelsius
          ? `${kelvinToCelsius(data?.main.temp).toFixed(0)}°C`
          : `${kelvinToFahrenheit(data?.main.temp).toFixed(0)}°F`,
    },
    {
      label: 'Min Temp',
      value:
        data && inCelsius
          ? `${kelvinToCelsius(data?.main.temp).toFixed(0)}°C`
          : `${kelvinToFahrenheit(data?.main.temp).toFixed(0)}°F`,
    },
    {
      label: 'Max Temp',
      value:
        data && inCelsius
          ? `${kelvinToCelsius(data?.main.temp).toFixed(0)}°C`
          : `${kelvinToFahrenheit(data?.main.temp).toFixed(0)}°F`,
    },
    {
      label: 'Pressure',
      value: data && `${data.main.pressure.toFixed(0)}`,
    },
  ];

  useEffect(() => {
    const decodedParams = decodeURIComponent(params.id);
    const paramsArray = decodedParams.split('&');
    const paramsObject = paramsArray.reduce((acc, current) => {
      const [key, value] = current.split('=');
      acc[key] = value;
      return acc;
    }, {} as any);
    setCoordinates({ lat: paramsObject.lat, lon: paramsObject.lon });
  }, [params]);

  useEffect(() => {
    if (coordinates.lat && coordinates.lon) {
      fetchData();
      fetchHourlyData();
    }
  }, [coordinates]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${APIKey}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newData = await response.json();
      console.log(newData);

      setData(newData);
      // setting up background image
      switch (newData.weather[0].main.toLowerCase()) {
        case 'clouds':
          setImage(CloudyImage);
          break;
        case 'rain':
          setImage(RainingImage);
          break;
        case 'clear':
          setImage(SunnyImage);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Fetching data failed:', error);
    }
  };

  const fetchHourlyData = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${APIKey}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newData = await response.json();
      setHourlyData(newData.list);

      const fullWeekData = newData.list.filter(
        (_: any, index: number) => index % 8 === 0
      );
      setWeeklyData(fullWeekData);
    } catch (error) {
      console.error('Fetching data failed:', error);
    }
  };

  return (
    <section className="py-12 md:py-20 min-h-screen flex justify-center items-center bg-gray-50 z-10">
      <div className="container px-4 mx-auto">
        <div className="relative shadow-md rounded-3xl mx-auto max-w-[1100px] grid grid-cols-4 overflow-hidden z-10">
          {image && (
            <Image
              src={image.src}
              priority={false}
              width={400}
              height={400}
              alt="bg image"
              className="absolute w-full h-full inset-0 object-cover -z-10"
            />
          )}
          <div className="col-span-4 lg:col-span-3 bg-white bg-opacity-80 py-8 px-12">
            {/* city name and date */}
            <div className="flex justify-between items-center gap-4 text-lg md:text-2xl font-medium">
              {data ? <h4>{data?.name}</h4> : <TextLoader />}
              {data ? <p>{convertUnixTimeToDate(data?.dt)}</p> : <TextLoader />}
            </div>
            {/* temperature */}
            <div className="flex flex-col gap-y-6 justify-center items-center my-12 md:my-20 text-grayText">
              {data ? (
                <div className="flex items-end">
                  <h1 className="text-9xl md:text-[180px] !leading-none font-medium tracking-tighter">
                    {inCelsius
                      ? `${kelvinToCelsius(data.main.temp).toFixed(0)}°`
                      : `${kelvinToFahrenheit(data.main.temp).toFixed(0)}°`}
                  </h1>
                  <span className="!text-3xl mb-4">
                    {inCelsius ? 'C' : 'F'}
                  </span>
                </div>
              ) : (
                <TextLoader />
              )}
              <div className="flex items-center gap-x-8">
                <h5>
                  Wind Speed:
                  <span className="font-semibold">
                    {data && data.wind.speed}mph
                  </span>
                </h5>
                <h5>
                  Humidity:
                  <span className="font-semibold">
                    {data && data.main.humidity}%
                  </span>
                </h5>
              </div>
              <p className="text-4xl md:text-5xl font-medium tracking-tight">
                {data && data.weather[0].main}
              </p>
            </div>
            {/* day to day or weekly forecast */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {weeklyData ? (
                weeklyData.map((item, i) => (
                  <div
                    className="flex flex-col justify-center items-center gap-y-2 p-3 rounded-md border border-primary border-opacity-40"
                    key={i}
                  >
                    <p className="font-medium text-primary uppercase">
                      {convertUnixTimeToDay(item.dt)}
                    </p>
                    <h5 className="text-grayText text-xl font-semibold">
                      {inCelsius
                        ? `${kelvinToCelsius(item.main.temp).toFixed(0)}°C`
                        : `${kelvinToFahrenheit(item.main.temp).toFixed(0)}°F`}
                    </h5>
                    <p className="text-sm opacity-60">{item.weather[0].main}</p>
                  </div>
                ))
              ) : (
                <CardLoader length={5} />
              )}
            </div>
          </div>
          {/* sidebar */}
          <div className="col-span-4 lg:col-span-1 bg-gray-100 p-8 px-3 text-center">
            <div className="flex flex-col justify-between items-center h-full">
              {/* time */}
              <div>
                <button
                  className="bg-primary bg-opacity-30 py-2 px-6 lg:px-8 rounded-md font-medium hover:bg-opacity-90 duration-500 cursor-pointer"
                  onClick={() => setInCelsius((prev) => !prev)}
                >
                  View In {inCelsius ? 'Fahrenheit' : 'Celsius'}
                </button>
                {data ? (
                  <h6 className="text-2xl font-medium mt-6 mb-12">
                    {convertUnixTimeToLocalTime(data?.dt, data?.timezone)}
                  </h6>
                ) : (
                  <TextLoader />
                )}
              </div>

              {/* additional data */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {data &&
                  additionalData.map((item, index) => (
                    <h5
                      key={index}
                      className="bg-primary bg-opacity-15 py-1 px-2 rounded text-[13px]"
                    >
                      {item.label}:
                      <span className="font-semibold">{item.value}</span>
                    </h5>
                  ))}
              </div>

              <div className="mt-12">
                <p className="text-xl font-medium mb-4">Hourly Forcast</p>
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-3 w-full gap-4 lg:gap-2">
                  {hourlyData ? (
                    hourlyData.slice(0, 6).map((item, i) => (
                      <div
                        className="w-full flex flex-col gap-y-2 p-3 rounded-md border"
                        key={i}
                      >
                        <p>{convertUnixTimeToHour(item.dt)}</p>
                        <h5 className="text-grayText text-xl font-semibold">
                          {inCelsius
                            ? `${kelvinToCelsius(item.main.temp).toFixed(0)}°C`
                            : `${kelvinToFahrenheit(item.main.temp).toFixed(
                                0
                              )}°F`}
                        </h5>
                        <p className="text-sm opacity-60">
                          {item.weather[0].main}
                        </p>
                      </div>
                    ))
                  ) : (
                    <CardLoader />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Weather;
