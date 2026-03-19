
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route as RouterRoute, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";

// Pages
import Home from "./pages/Home";
import RouteView from "./pages/Route";
import AirMap from "./pages/AirMap";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import HealthTips from "./pages/HealthTips";
import SavedPlaces from "./pages/SavedPlaces";
import Alerts from "./pages/Alerts";
import BottomNav from "./components/BottomNav";
import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
    const { isOnboardingComplete } = useUser();

    if (!isOnboardingComplete) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

const RequireNoOnboarding = ({ children }: { children: React.ReactNode }) => {
    const { isOnboardingComplete } = useUser();

    if (isOnboardingComplete) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const AppRoutes = () => {
    const { isOnboardingComplete } = useUser();

    return (
        <>
            <Routes>
                <RouterRoute
                    path="/onboarding"
                    element={
                        <RequireNoOnboarding>
                            <Onboarding />
                        </RequireNoOnboarding>
                    }
                />
                <RouterRoute
                    path="/"
                    element={
                        <RequireOnboarding>
                            <Home />
                        </RequireOnboarding>
                    }
                />
                <RouterRoute
                    path="/route"
                    element={
                        <RequireOnboarding>
                            <RouteView />
                        </RequireOnboarding>
                    }
                />
                <RouterRoute
                    path="/map"
                    element={
                        <RequireOnboarding>
                            <AirMap />
                        </RequireOnboarding>
                    }
                />
                <RouterRoute
                    path="/profile"
                    element={
                        <RequireOnboarding>
                            <Profile />
                        </RequireOnboarding>
                    }
                />
                <RouterRoute
                    path="/history"
                    element={
                        <RequireOnboarding>
                            <History />
                        </RequireOnboarding>
                    }
                />
                <RouterRoute
                    path="/tips"
                    element={
                        <RequireOnboarding>
                            <HealthTips />
                        </RequireOnboarding>
                    }
                />
                <RouterRoute
                    path="/saved-places"
                    element={
                        <RequireOnboarding>
                            <SavedPlaces />
                        </RequireOnboarding>
                    }
                />
                <RouterRoute
                    path="/alerts"
                    element={
                        <RequireOnboarding>
                            <Alerts />
                        </RequireOnboarding>
                    }
                />
                <RouterRoute path="*" element={<NotFound />} />
            </Routes>

            {isOnboardingComplete && <BottomNav />}
        </>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
                <UserProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </UserProvider>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
