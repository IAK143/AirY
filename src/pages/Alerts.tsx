import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  BellOff,
  BellRing,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const AQI_LEVELS = [
  { value: 1, label: 'Good', color: 'bg-emerald-500', description: 'Air quality is satisfactory' },
  { value: 2, label: 'Fair', color: 'bg-lime-500', description: 'Acceptable for most people' },
  { value: 3, label: 'Moderate', color: 'bg-amber-500', description: 'Sensitive groups may be affected' },
  { value: 4, label: 'Poor', color: 'bg-red-500', description: 'Health effects for everyone' },
  { value: 5, label: 'Very Poor', color: 'bg-red-800', description: 'Serious health risk' },
];

const Alerts = () => {
  const { alertConfig, updateAlertConfig, user } = useUser();

  const handleToggle = (enabled: boolean) => {
    updateAlertConfig({ enabled });
    toast({
      title: enabled ? 'Alerts Enabled' : 'Alerts Disabled',
      description: enabled
        ? 'You will be notified when air quality exceeds your threshold.'
        : 'Air quality alerts have been turned off.',
    });
  };

  const handleThresholdChange = (value: number[]) => {
    updateAlertConfig({ threshold: value[0] });
  };

  const handleImprovementToggle = (notifyOnImprovement: boolean) => {
    updateAlertConfig({ notifyOnImprovement });
  };

  const currentLevel = AQI_LEVELS.find((l) => l.value === alertConfig.threshold);

  return (
    <div className="container mx-auto pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 pb-4"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          AQ Alerts
        </h1>
        <p className="text-muted-foreground mt-1">
          Get notified when air quality changes
        </p>
      </motion.div>

      <div className="space-y-5">
        {/* Master Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`border-2 transition-all ${alertConfig.enabled ? 'border-blue-200 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${alertConfig.enabled ? 'bg-blue-500/10' : 'bg-gray-500/10'}`}>
                    {alertConfig.enabled ? (
                      <BellRing className="h-6 w-6 text-blue-600" />
                    ) : (
                      <BellOff className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Air Quality Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      {alertConfig.enabled ? 'Monitoring your air quality' : 'Alerts are currently off'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={alertConfig.enabled}
                  onCheckedChange={handleToggle}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Threshold Config */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={!alertConfig.enabled ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Alert Threshold
              </CardTitle>
              <CardDescription>
                Notify me when AQI reaches or exceeds this level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Threshold: AQI {alertConfig.threshold}
                  </Label>
                  {currentLevel && (
                    <Badge className={`text-white ${currentLevel.color}`}>
                      {currentLevel.label}
                    </Badge>
                  )}
                </div>
                <Slider
                  value={[alertConfig.threshold]}
                  onValueChange={handleThresholdChange}
                  min={1}
                  max={5}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Good</span>
                  <span>Fair</span>
                  <span>Moderate</span>
                  <span>Poor</span>
                  <span>Very Poor</span>
                </div>
              </div>

              {/* Level Preview */}
              <div className="space-y-2">
                {AQI_LEVELS.map((level) => {
                  const isActive = level.value >= alertConfig.threshold;
                  return (
                    <div
                      key={level.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        isActive
                          ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'
                          : 'border-transparent bg-gray-50 dark:bg-gray-900 opacity-50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${level.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{level.label}</p>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                      </div>
                      {isActive ? (
                        <Bell className="h-4 w-4 text-blue-600" />
                      ) : (
                        <BellOff className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={!alertConfig.enabled ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="improvement-toggle" className="text-sm font-medium">
                    Notify on improvement
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Get notified when air quality improves below threshold
                  </p>
                </div>
                <Switch
                  id="improvement-toggle"
                  checked={alertConfig.notifyOnImprovement}
                  onCheckedChange={handleImprovementToggle}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  {user?.sensitivityLevel === 'high'
                    ? 'With high sensitivity, we recommend setting threshold to 2 (Fair) or lower.'
                    : user?.sensitivityLevel === 'low'
                    ? 'With low sensitivity, a threshold of 3 (Moderate) is usually sufficient.'
                    : 'With medium sensitivity, a threshold of 3 (Moderate) is recommended.'}
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Alerts;
