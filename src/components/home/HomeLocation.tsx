import { Location } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw, MapPin, Navigation, Map } from 'lucide-react';
import SimpleMap from '@/components/SimpleMap';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { reverseGeocode } from '@/services/api';
import { getLocationDetails } from '@/utils/tomtomUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeLocationProps {
  userLocation: Location | null;
  refreshing: boolean;
  onRefresh: () => void;
}

const HomeLocation = ({ userLocation, refreshing, onRefresh }: HomeLocationProps) => {
  const [locationWithName, setLocationWithName] = useState<Location | null>(userLocation);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const getLocationName = async () => {
      if (!userLocation) {
        setLocationWithName(null);
        setInitialLoading(false);
        return;
      }
      
      if (!userLocation.name || userLocation.name.includes("Location at")) {
        try {
          const tomtomDetails = await getLocationDetails(userLocation.lat, userLocation.lng);
          
          if (tomtomDetails && tomtomDetails.name && !tomtomDetails.name.includes("Location at")) {
            setLocationWithName({
              ...userLocation,
              name: tomtomDetails.name,
              address: tomtomDetails.address
            });
            setInitialLoading(false);
            return;
          }
          
          const apiDetails = await reverseGeocode(userLocation.lat, userLocation.lng);
          
          if (apiDetails && apiDetails.name) {
            setLocationWithName({
              ...userLocation,
              name: apiDetails.name,
              address: apiDetails.address
            });
          } else {
            setLocationWithName(userLocation);
          }
        } catch (error) {
          console.error("Error getting location name:", error);
          setLocationWithName(userLocation);
        }
      } else {
        setLocationWithName(userLocation);
      }
      setInitialLoading(false);
    };
    
    getLocationName();
  }, [userLocation]);

  if (initialLoading || refreshing) {
    return (
      <div className="relative w-full h-[35vh]">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[400] bg-background/60 backdrop-blur-md p-4 rounded-xl border border-white/20">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-10 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[45vh] animate-fade-in">
      <SimpleMap 
        center={locationWithName || undefined}
        markers={locationWithName ? [locationWithName] : []}
        className="absolute inset-0 w-full h-full rounded-none z-0"
        interactive={false}
        animateLocations={true}
        mapHeight="100%"
      />
      
      <div className="absolute top-safe pt-2 left-4 right-4 z-[400]">
        <div className="bg-background/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg p-4 rounded-xl flex justify-between items-start">
          <div className="space-y-1 truncate pr-2">
            {locationWithName ? (
              <>
                <p className={cn(
                  "font-bold text-sm truncate",
                  locationWithName.name ? "text-foreground" : "text-muted-foreground italic"
                )}>
                  {locationWithName.name || "Getting location..."}
                </p>
                <div className="flex items-center text-xs text-muted-foreground gap-1 animate-fade-in">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{locationWithName.address || `${locationWithName.lat.toFixed(6)}, ${locationWithName.lng.toFixed(6)}`}</span>
                </div>
              </>
            ) : (
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Map className="h-4 w-4" /> No location detected
              </p>
            )}
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Button 
              size="icon" 
              variant="secondary" 
              onClick={onRefresh}
              disabled={refreshing}
              className="h-8 w-8 rounded-full shadow-sm bg-white/50 hover:bg-white/80 dark:bg-black/50 dark:hover:bg-black/80 backdrop-blur-md border border-white/20"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <RefreshCcw className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {!locationWithName && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-[300]">
          <div className="bg-white/90 dark:bg-black/90 backdrop-blur p-4 rounded-lg shadow-lg text-center max-w-xs border border-white/20">
            <Map className="h-10 w-10 mx-auto text-primary mb-2" />
            <p className="text-sm font-medium">No location set</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click refresh to detect your current location
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeLocation;
