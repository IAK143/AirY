import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { AirQualityData } from '@/types';
import { fetchAirQuality, getAirQualityLevel } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Shield,
  Wind,
  Droplets,
  Activity,
  Eye,
  Baby,
  TreeDeciduous,
  Dumbbell,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HealthTip {
  icon: any;
  title: string;
  description: string;
  severity: 'safe' | 'caution' | 'warning' | 'danger';
}

const generateTips = (
  aqi: number,
  hasRespiratoryIssues: boolean,
  sensitivityLevel: 'low' | 'medium' | 'high'
): HealthTip[] => {
  const tips: HealthTip[] = [];

  // Always-applicable general tips
  if (aqi <= 2) {
    tips.push({
      icon: CheckCircle2,
      title: 'Great day for outdoor activities!',
      description: 'Air quality is good. Perfect for jogging, cycling, or a walk in the park.',
      severity: 'safe',
    });
    tips.push({
      icon: TreeDeciduous,
      title: 'Open your windows',
      description: 'Let fresh air circulate through your home and workspace today.',
      severity: 'safe',
    });
    tips.push({
      icon: Dumbbell,
      title: 'Outdoor workout recommended',
      description: 'Take advantage of the clean air for any outdoor exercise routine.',
      severity: 'safe',
    });
  }

  if (aqi === 3) {
    tips.push({
      icon: Info,
      title: 'Moderate air quality',
      description: 'Air quality is acceptable. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.',
      severity: 'caution',
    });
    tips.push({
      icon: Wind,
      title: 'Check wind direction',
      description: 'Pollution may be higher downwind from roads or industrial areas.',
      severity: 'caution',
    });
  }

  if (aqi >= 4) {
    tips.push({
      icon: AlertTriangle,
      title: 'Limit outdoor exposure',
      description: 'Reduce prolonged outdoor exertion. Consider indoor activities instead.',
      severity: 'warning',
    });
    tips.push({
      icon: Shield,
      title: 'Use an N95 mask outdoors',
      description: 'An N95 or equivalent mask can filter out fine particulate matter (PM2.5).',
      severity: 'danger',
    });
    tips.push({
      icon: Wind,
      title: 'Keep windows closed',
      description: 'Use air conditioning with recirculation mode instead of opening windows.',
      severity: 'warning',
    });
  }

  if (aqi >= 5) {
    tips.push({
      icon: AlertTriangle,
      title: 'Health emergency conditions',
      description: 'Avoid all outdoor physical activity. Stay indoors with air purification if possible.',
      severity: 'danger',
    });
  }

  // Respiratory-specific tips
  if (hasRespiratoryIssues) {
    if (aqi >= 2) {
      tips.push({
        icon: Activity,
        title: 'Keep your inhaler handy',
        description: 'Given your respiratory conditions, keep your rescue inhaler accessible at all times today.',
        severity: aqi >= 3 ? 'warning' : 'caution',
      });
    }

    if (aqi >= 3) {
      tips.push({
        icon: Heart,
        title: 'Monitor your symptoms',
        description: 'Watch for coughing, wheezing, or shortness of breath. Seek medical attention if symptoms worsen.',
        severity: 'warning',
      });
    }
  }

  // Sensitivity-specific tips
  if (sensitivityLevel === 'high') {
    tips.push({
      icon: Eye,
      title: 'Watch for irritation',
      description: 'High sensitivity means even moderate pollution can cause eye, nose, or throat irritation.',
      severity: aqi >= 2 ? 'caution' : 'safe',
    });

    if (aqi >= 2) {
      tips.push({
        icon: Droplets,
        title: 'Stay hydrated',
        description: 'Drinking plenty of water helps your body manage the effects of air pollution.',
        severity: 'caution',
      });
    }
  }

  if (sensitivityLevel !== 'low') {
    tips.push({
      icon: Baby,
      title: 'Protect children & elderly',
      description: 'Children and elderly family members are more susceptible. Limit their outdoor time when AQI is above 2.',
      severity: aqi >= 3 ? 'warning' : 'caution',
    });
  }

  return tips;
};

const severityStyles: Record<string, { bg: string; border: string; icon: string }> = {
  safe: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600',
  },
  caution: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600',
  },
  warning: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600',
  },
};

const HealthTips = () => {
  const { user } = useUser();
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const location = user?.homeLocation || { lat: 40.7128, lng: -74.0060 };
      const data = await fetchAirQuality(location.lat, location.lng);
      if (data) setAirQuality(data);
      setLoading(false);
    };
    loadData();
  }, [user?.homeLocation]);

  const tips = airQuality
    ? generateTips(
        airQuality.aqi,
        user?.hasRespiratoryIssues || false,
        user?.sensitivityLevel || 'medium'
      )
    : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 pb-4"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
          Health Tips
        </h1>
        <p className="text-muted-foreground mt-1">
          Personalized advice based on today's air quality
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* AQI Summary */}
          {airQuality && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-2 border-rose-100 bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-rose-950 dark:border-rose-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-500/10">
                        <Heart className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Today's AQI: {airQuality.aqi}</h3>
                        <p className="text-sm text-muted-foreground">{getAirQualityLevel(airQuality.aqi)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {user?.sensitivityLevel || 'medium'} sensitivity
                      </Badge>
                      {user?.hasRespiratoryIssues && (
                        <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          Respiratory
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tips */}
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {tips.map((tip, index) => {
              const styles = severityStyles[tip.severity];
              const Icon = tip.icon;
              return (
                <motion.div key={index} variants={item}>
                  <Card className={`${styles.bg} ${styles.border} border-2 transition-all hover:shadow-md`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`p-2 rounded-xl ${styles.bg}`}>
                        <Icon className={`h-5 w-5 ${styles.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {tips.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Unable to load health tips right now.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthTips;
