
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AirQualityData, Location, WeatherData } from '@/types';
import { fetchAirQuality, fetchWeather } from '@/services/api';
import HomeLocation from '@/components/home/HomeLocation';
import HomeStats from '@/components/home/HomeStats';
import HomeActions from '@/components/home/HomeActions';
import HomeAlert from '@/components/home/HomeAlert';
import ThemeToggle from '@/components/ThemeToggle';

const Home = () => {
    const { user } = useUser();
    const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [userLocation, setUserLocation] = useState<Location | null>(null);

    const fetchData = async (location: Location) => {
        setLoading(true);
        try {
            const [aqData, weatherData] = await Promise.all([
                fetchAirQuality(location.lat, location.lng),
                fetchWeather(location.lat, location.lng)
            ]);

            if (aqData) setAirQuality(aqData);
            if (weatherData) setWeather(weatherData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.homeLocation) {
            console.log("Using home location:", user.homeLocation);
            fetchData(user.homeLocation);
            setUserLocation(user.homeLocation);
        } else {
            console.log("Attempting to get user's current location");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentLocation: Location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log("Got user location:", currentLocation);
                    setUserLocation(currentLocation);
                    fetchData(currentLocation);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
                    console.log("Using default location:", defaultLocation);
                    setUserLocation(defaultLocation);
                    fetchData(defaultLocation);
                }
            );
        }
    }, [user?.homeLocation]);

    const handleRefresh = async () => {
        if (!userLocation) return;

        setRefreshing(true);
        await fetchData(userLocation);
        setRefreshing(false);
    };

    return (
        <div className="relative min-h-screen pb-24">
            {/* Background Map */}
            <div className="fixed inset-0 z-0 h-[45vh]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
                <HomeLocation
                    userLocation={userLocation}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 container mx-auto px-4 pt-[30vh]">
                <div className="flex items-center justify-between mb-6 drop-shadow-md">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            AirY
                        </h1>
                        <p className="font-semibold mt-1">
                            Hello, {user?.name || 'there'}!
                        </p>
                    </div>
                    <ThemeToggle />
                </div>

                <div className="space-y-4">
                    <HomeStats
                        airQuality={airQuality}
                        weather={weather}
                        loading={loading}
                    />

                    <HomeActions />

                    <HomeAlert airQuality={airQuality} />
                </div>
            </div>
        </div>
    );
};

export default Home;
