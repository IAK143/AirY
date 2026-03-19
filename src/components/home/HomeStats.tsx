
import { AirQualityData, Location, WeatherData } from '@/types';
import AirQualityIndicator from '@/components/AirQualityIndicator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeStatsProps {
  airQuality: AirQualityData | null;
  weather: WeatherData | null;
  loading: boolean;
}

const HomeStats = ({ airQuality, weather, loading }: HomeStatsProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-14 w-14 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="backdrop-blur-xl bg-background/60 rounded-2xl p-1 shadow-lg border border-white/20 dark:border-white/10">
        <AirQualityIndicator 
          data={airQuality} 
          isLoading={loading} 
        />
      </div>
      
      {weather && (
        <Card className="backdrop-blur-xl bg-background/60 border-white/20 dark:border-white/10 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="font-medium">Weather</h3>
                <div className="flex items-center mt-1">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{Math.round(weather.temp)}°C</span>
                    <span className="text-sm capitalize text-muted-foreground">{weather.description}</span>
                  </div>
                </div>
              </div>
              
              <div className="h-14 w-14">
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt="Weather icon" 
                  className="h-full w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex items-center space-x-2 border border-white/20 rounded-md p-2 bg-white/40 dark:bg-black/40">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Humidity</span>
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 border border-white/20 rounded-md p-2 bg-white/40 dark:bg-black/40">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Wind</span>
                  <span className="font-medium">{weather.windSpeed} m/s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default HomeStats;
