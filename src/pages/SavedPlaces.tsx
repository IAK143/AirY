import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AirQualityData, Location } from '@/types';
import { fetchAirQuality, getAirQualityLevel, getAirQualityColor } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LocationSearch from '@/components/LocationSearch';
import {
  Bookmark,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  MapPin,
  Wind,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SavedPlaces = () => {
  const { savedPlaces, addSavedPlace, removeSavedPlace, updateSavedPlace } = useUser();
  const [showSearch, setShowSearch] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

  const handleAddPlace = (location: Location) => {
    addSavedPlace({
      name: location.name || location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      location,
    });
    setShowSearch(false);
  };

  const refreshPlace = async (placeId: string, location: Location) => {
    setRefreshingId(placeId);
    const data = await fetchAirQuality(location.lat, location.lng);
    if (data) {
      updateSavedPlace(placeId, {
        lastAQI: data.aqi,
        lastChecked: new Date().toISOString(),
      });
    }
    setRefreshingId(null);
  };

  const refreshAll = async () => {
    setRefreshingAll(true);
    for (const place of savedPlaces) {
      const data = await fetchAirQuality(place.location.lat, place.location.lng);
      if (data) {
        updateSavedPlace(place.id, {
          lastAQI: data.aqi,
          lastChecked: new Date().toISOString(),
        });
      }
    }
    setRefreshingAll(false);
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (savedPlaces.length > 0 && savedPlaces.some(p => !p.lastAQI)) {
      refreshAll();
    }
  }, []);

  const AQI_COLORS: Record<number, string> = {
    1: 'bg-emerald-500',
    2: 'bg-lime-500',
    3: 'bg-amber-500',
    4: 'bg-red-500',
    5: 'bg-red-800',
  };

  const AQI_LABELS: Record<number, string> = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor',
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <div className="container mx-auto pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 pb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Saved Places
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor air quality at your favorite locations
            </p>
          </div>
          <div className="flex gap-2">
            {savedPlaces.length > 0 && (
              <Button variant="outline" size="sm" onClick={refreshAll} disabled={refreshingAll}>
                {refreshingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            )}
            <Button size="sm" onClick={() => setShowSearch(!showSearch)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {/* Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Add a Place</CardTitle>
                  <CardDescription>Search for a location to add</CardDescription>
                </CardHeader>
                <CardContent>
                  <LocationSearch
                    onLocationSelect={handleAddPlace}
                    placeholder="Search for a place (e.g., office, gym...)"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Places List */}
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {savedPlaces.map((place) => (
              <motion.div key={place.id} variants={item} exit={{ opacity: 0, x: 20 }} layout>
                <Card className="overflow-hidden hover:shadow-md transition-all border-2 border-transparent hover:border-amber-200 dark:hover:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-amber-500/10">
                        <MapPin className="h-5 w-5 text-amber-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{place.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}
                        </p>
                        {place.lastChecked && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Updated {new Date(place.lastChecked).toLocaleTimeString()}
                          </p>
                        )}
                      </div>

                      {/* AQI Badge */}
                      {place.lastAQI ? (
                        <Badge
                          className={`text-white font-semibold ${AQI_COLORS[place.lastAQI] || 'bg-gray-500'}`}
                        >
                          AQI {place.lastAQI} · {AQI_LABELS[place.lastAQI]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Wind className="h-3 w-3 mr-1" /> No data
                        </Badge>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => refreshPlace(place.id, place.location)}
                          disabled={refreshingId === place.id}
                        >
                          {refreshingId === place.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => removeSavedPlace(place.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {savedPlaces.length === 0 && !showSearch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-12 text-center">
                <div className="p-4 rounded-full bg-amber-500/10 w-fit mx-auto mb-4">
                  <Bookmark className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No saved places yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add your workplace, gym, school, or any location to monitor its air quality.
                </p>
                <Button onClick={() => setShowSearch(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Place
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedPlaces;
