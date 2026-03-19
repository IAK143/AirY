
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, Map, User, ArrowRight, BarChart3, Heart, Bookmark, Bell, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';

const HomeActions = () => {
    const navigate = useNavigate();
    const { getAvailableCredits } = useUser();
    const credits = getAvailableCredits();

    const actions = [
        {
            title: 'Plan Clean Route',
            description: 'Find the path with the lowest air pollution.',
            icon: Navigation,
            path: '/route',
            color: 'bg-blue-500/10 text-blue-600',
        },
        {
            title: 'AQ History',
            description: 'View air quality trends and 5-day forecast.',
            icon: BarChart3,
            path: '/history',
            color: 'bg-violet-500/10 text-violet-600',
        },
        {
            title: 'Health Tips',
            description: 'Personalized advice based on today\'s air quality.',
            icon: Heart,
            path: '/tips',
            color: 'bg-rose-500/10 text-rose-600',
        },
        {
            title: 'Saved Places',
            description: 'Monitor air quality at your favorite locations.',
            icon: Bookmark,
            path: '/saved-places',
            color: 'bg-amber-500/10 text-amber-600',
        },
        {
            title: 'AQ Alerts',
            description: 'Get notified when air quality drops.',
            icon: Bell,
            path: '/alerts',
            color: 'bg-cyan-500/10 text-cyan-600',
        },
        {
            title: 'Explore Map',
            description: 'Check air quality across different areas.',
            icon: Map,
            path: '/map',
            color: 'bg-emerald-500/10 text-emerald-600',
        },
        {
            title: 'Your Profile',
            description: 'Update your health sensitivity settings.',
            icon: User,
            path: '/profile',
            color: 'bg-purple-500/10 text-purple-600',
        },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-4">
            {/* Credits Quick View */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
            >
                <Card
                    className="overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 cursor-pointer group hover:shadow-md transition-all"
                    onClick={() => navigate('/route')}
                >
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base">Air Credits</h3>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-bold text-blue-600">{credits}</span> / 24 credits available
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Action Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-3 pb-8"
            >
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <motion.div key={index} variants={item}>
                            <Card 
                                className="overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group rounded-3xl h-full flex flex-col justify-center" 
                                onClick={() => navigate(action.path)}
                            >
                                <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
                                    <div className={`p-4 rounded-2xl ${action.color} group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 min-w-0 w-full space-y-1">
                                        <h3 className="font-bold text-sm leading-tight">{action.title}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default HomeActions;
