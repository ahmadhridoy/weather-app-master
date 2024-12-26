'use client';

import { useEffect, useState, useRef, FC } from 'react';
import Link from 'next/link';
import { debounce } from 'lodash';
import { FaFilter } from 'react-icons/fa6';

interface CityRecord {
  [key: string]: any;
}

const timezoneList = [
  'Asia',
  'Europe',
  'America',
  'Australia',
  'Africa',
  'Indian',
  'Pacific',
];

const Home: FC = () => {
  const [data, setData] = useState<CityRecord[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchedText, setsearchedText] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CityRecord[]>([]);
  const loader = useRef<HTMLDivElement>(null);

  // infinite scroll
  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0];
    if (target.isIntersecting && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    });
    if (loader.current) {
      observer.observe(loader.current);
    }
    return () => observer.disconnect();
  }, []);

  // initial data data fetching
  useEffect(() => {
    fetchData();
  }, [page]);
  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=20&offset=${
          page * 20
        }`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newData = await response.json();
      setData((prevData) => [...prevData, ...newData.results]);
      setHasMore(newData.results.length > 0);
    } catch (error) {
      console.error('Fetching data failed:', error);
    }
  };

  // search functionality
  useEffect(() => {
    if (searchedText.length > 0) {
      debouncedFetch(searchedText);
    } else {
      setSuggestions([]);
    }
  }, [searchedText]);
  const fetchSearchedData = async (value: string) => {
    try {
      const response = await fetch(
        `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?where=search(ascii_name,"${value}")`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newData = await response.json();
      setSuggestions(newData.results);
      setHasMore(newData.results.length > 0);
    } catch (error) {
      console.error('Fetching data failed:', error);
    }
  };
  const debouncedFetch = useRef(
    debounce((nextValue: string) => fetchSearchedData(nextValue), 500)
  ).current;

  return (
    <section className="min-h-screen flex justify-center items-center py-12 md:py-20 z-10">
      <div className="container px-4 mx-auto">
        <div className="mb-12">
          <h1 className="text-center text-4xl md:text-6xl font-bold mb-6">
            Weather Forecast
          </h1>
          <div className="relative flex justify-center items-center max-w-96 mx-auto">
            <input
              type="text"
              placeholder="Search with city name..."
              className="shadow bg-white w-96 mx-auto py-3 px-6 rounded-full border focus:outline-primary"
              value={searchedText}
              onChange={(e) => setsearchedText(e.target.value)}
            />
            {suggestions.length > 0 && (
              <div
                className={`absolute top-[111%] bg-white border rounded min-w-[90%] z-[100]`}
              >
                <ul>
                  {suggestions.slice(0, 5).map((item, i) => (
                    <li key={i}>
                      <Link
                        href={`/weather/lat=${item.coordinates.lat}&lon=${item.coordinates.lon}`}
                        className={`${
                          i !== 4 && 'border-b'
                        } !p-4 py-4 block hover:bg-primary hover:text-white duration-500 w-full`}
                      >
                        {item.ascii_name}, {item.cou_name_en}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col overflow-x-auto max-w-[1100px] mx-auto border rounded">
          <table className="min-w-full">
            <thead className="border-b border-neutral-200 font-medium">
              <tr>
                <th scope="col" className="p-4">
                  City Name
                </th>
                <th scope="col" className="p-4">
                  Country
                </th>
                <th scope="col" className="p-4">
                  Timezone
                </th>
                <th scope="col" className="p-4">
                  View Details
                </th>
              </tr>
            </thead>
            <tbody>
              {data &&
                data.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-neutral-200 text-center"
                  >
                    <td className="whitespace-nowrap p-4 font-medium">
                      <Link
                        href={`/weather/lat=${item?.coordinates?.lat}&lon=${item?.coordinates?.lon}`}
                      >
                        {item.ascii_name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {item.cou_name_en}
                    </td>
                    <td className="whitespace-nowrap p-4">{item.timezone}</td>
                    <td className="whitespace-nowrap p-4">
                      <Link
                        href={`/weather/lat=${item.coordinates?.lat}&lon=${item.coordinates?.lon}`}
                        className="bg-primary rounded-md text-white text-sm font-medium px-5 py-2"
                      >
                        Check Weather
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div ref={loader} />
        </div>
      </div>
    </section>
  );
};

export default Home;
