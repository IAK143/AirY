import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, Navigation, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Navigation, label: 'Route', path: '/route' },
        { icon: MapIcon, label: 'Map', path: '/map' },
        { icon: User, label: 'Profile', path: '/profile' }
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-xl border shadow-lg rounded-full px-6 py-2 w-[90%] max-w-sm">
            <div className="flex items-center justify-between gap-2 h-14">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center relative w-16 h-full gap-1 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground hover:scale-105"
                            )}
                        >
                            <Icon className={cn("h-6 w-6 transition-all duration-300", isActive && "fill-primary/20 stroke-primary stroke-[2.5px]")} />
                            <span className={cn(
                                "text-[10px] font-semibold leading-none transition-all duration-300",
                                isActive ? "opacity-100" : "opacity-70"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-primary"
                                />
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
