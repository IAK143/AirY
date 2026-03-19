import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AirQualityData } from '@/types';
import { fetchAirQuality } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, RefreshCw, Loader2, Wind, Droplets, CloudSun, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

interface ForecastDataPoint {
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
}

const AQI_LABELS: Record<number, string> = {
  1: 'Good',
  2: 'Fair',
  3: 'Moderate',
  4: 'Poor',
  5: 'Very Poor',
};

const AQI_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#84cc16',
  3: '#f59e0b',
  4: '#ef4444',
  5: '#7c2d12',
};

const History = () => {
  const { user } = useUser();
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [currentAQ, setCurrentAQ] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'area' | 'bar'>('area');

  const fetchForecastData = async () => {
    setLoading(true);
    const location = user?.homeLocation || { lat: 40.7128, lng: -74.0060 };

    try {
      // Fetch current AQ
      const currentData = await fetchAirQuality(location.lat, location.lng);
      if (currentData) setCurrentAQ(currentData);

      // Fetch 5-day forecast
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${location.lat}&lon=${location.lng}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        // Sample every 3 hours for the next 5 days
        const points: ForecastDataPoint[] = data.list
          .filter((_: any, i: number) => i % 3 === 0)
          .slice(0, 40)
          .map((item: any) => ({
            time: new Date(item.dt * 1000).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
            }),
            aqi: item.main.aqi,
            pm25: Math.round(item.components.pm2_5 * 10) / 10,
            pm10: Math.round(item.components.pm10 * 10) / 10,
            o3: Math.round(item.components.o3 * 10) / 10,
            no2: Math.round(item.components.no2 * 10) / 10,
          }));
        setForecastData(points);
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, [user?.homeLocation]);

  const getAQIBadge = (aqi: number) => (
    <Badge
      className="text-white font-semibold"
      style={{ backgroundColor: AQI_COLORS[aqi] || '#6b7280' }}
    >
      {AQI_LABELS[aqi] || 'Unknown'}
    </Badge>
  );

  return (
    <div className="container mx-auto pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 pb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              AQ History
            </h1>
            <p className="text-muted-foreground mt-1">
              Air quality trends & 5-day forecast
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchForecastData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      <div className="space-y-5">
        {/* Current Overview */}
        {currentAQ && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-2 border-violet-100 bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-violet-950 dark:border-violet-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/10">
                      <BarChart3 className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Current AQI</h3>
                      <p className="text-sm text-muted-foreground">Right now at your location</p>
                    </div>
                  </div>
                  {getAQIBadge(currentAQ.aqi)}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-background/60 border">
                    <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-muted-foreground">PM2.5</p>
                    <p className="font-bold text-sm">{currentAQ.pm25}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/60 border">
                    <Wind className="h-4 w-4 mx-auto text-cyan-500 mb-1" />
                    <p className="text-xs text-muted-foreground">PM10</p>
                    <p className="font-bold text-sm">{currentAQ.pm10}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/60 border">
                    <CloudSun className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                    <p className="text-xs text-muted-foreground">O₃</p>
                    <p className="font-bold text-sm">{currentAQ.o3}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/60 border">
                    <AlertTriangle className="h-4 w-4 mx-auto text-red-500 mb-1" />
                    <p className="text-xs text-muted-foreground">NO₂</p>
                    <p className="font-bold text-sm">{currentAQ.no2}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chart Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex gap-2">
            <Button
              variant={activeChart === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('area')}
            >
              Trend Line
            </Button>
            <Button
              variant={activeChart === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('bar')}
            >
              Bar Chart
            </Button>
          </div>
        </motion.div>

        {/* PM2.5 & PM10 Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PM2.5 & PM10 Forecast</CardTitle>
              <CardDescription>Particulate matter concentration (µg/m³)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  {activeChart === 'area' ? (
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="pm10Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="pm25" stroke="#8b5cf6" fill="url(#pm25Grad)" name="PM2.5" strokeWidth={2} />
                      <Area type="monotone" dataKey="pm10" stroke="#06b6d4" fill="url(#pm10Grad)" name="PM10" strokeWidth={2} />
                    </AreaChart>
                  ) : (
                    <BarChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="pm25" fill="#8b5cf6" name="PM2.5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pm10" fill="#06b6d4" name="PM10" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* O3 & NO2 Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">O₃ & NO₂ Forecast</CardTitle>
              <CardDescription>Gas concentration (µg/m³)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="o3Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="no2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="o3" stroke="#f59e0b" fill="url(#o3Grad)" name="Ozone (O₃)" strokeWidth={2} />
                    <Area type="monotone" dataKey="no2" stroke="#ef4444" fill="url(#no2Grad)" name="NO₂" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
