import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, Location, SavedRoute, SavedPlace, AQAlertConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { validateAndRedeemCode, PromoCode } from '@/config/promoCodes';

interface UserContextType {
  user: UserProfile | null;
  isOnboardingComplete: boolean;
  updateUser: (userData: Partial<UserProfile>) => void;
  setHomeLocation: (location: Location) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  saveRoute: (route: Omit<SavedRoute, 'id'>) => void;
  deleteRoute: (routeId: string) => void;
  useAirCredits: (amount: number) => boolean;
  getAvailableCredits: () => number;
  redeemPromoCode: (code: string) => { success: boolean; message: string; credits?: number };
  redeemedCodes: string[];
  savedPlaces: SavedPlace[];
  addSavedPlace: (place: Omit<SavedPlace, 'id'>) => void;
  removeSavedPlace: (placeId: string) => void;
  updateSavedPlace: (placeId: string, data: Partial<SavedPlace>) => void;
  alertConfig: AQAlertConfig;
  updateAlertConfig: (config: Partial<AQAlertConfig>) => void;
}

const defaultAlertConfig: AQAlertConfig = {
  enabled: true,
  threshold: 3,
  notifyOnImprovement: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [alertConfig, setAlertConfig] = useState<AQAlertConfig>(defaultAlertConfig);

  // Load user data and redeemed codes from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedOnboardingStatus = localStorage.getItem('onboardingComplete');
    const storedRedeemedCodes = localStorage.getItem('redeemedCodes');
    const storedSavedPlaces = localStorage.getItem('savedPlaces');
    const storedAlertConfig = localStorage.getItem('alertConfig');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const refreshedUser = refreshCreditsIfNeeded(parsedUser);
      setUser(refreshedUser);
    }
    
    if (storedOnboardingStatus) {
      setIsOnboardingComplete(JSON.parse(storedOnboardingStatus));
    }

    if (storedRedeemedCodes) {
      setRedeemedCodes(JSON.parse(storedRedeemedCodes));
    }

    if (storedSavedPlaces) {
      setSavedPlaces(JSON.parse(storedSavedPlaces));
    }

    if (storedAlertConfig) {
      setAlertConfig(JSON.parse(storedAlertConfig));
    }
  }, []);

  // Function to refresh credits if it's a new day
  const refreshCreditsIfNeeded = (userData: UserProfile): UserProfile => {
    const now = new Date();
    const lastRefresh = new Date(userData.lastCreditRefresh);
    
    // Check if it's a new day (comparing date strings without time)
    if (now.toDateString() !== lastRefresh.toDateString()) {
      return {
        ...userData,
        airCredits: 24, // Daily credit refresh
        lastCreditRefresh: now.toISOString()
      };
    }
    return userData;
  };

  // Function to use air credits
  const useAirCredits = (amount: number): boolean => {
    if (!user || user.airCredits < amount) {
      return false;
    }

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        airCredits: prev.airCredits - amount
      };
    });
    return true;
  };

  // Function to get available credits
  const getAvailableCredits = (): number => {
    if (!user) return 0;
    return user.airCredits;
  };

  // Save user data and redeemed codes to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    localStorage.setItem('onboardingComplete', JSON.stringify(isOnboardingComplete));
    localStorage.setItem('redeemedCodes', JSON.stringify(redeemedCodes));
    localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
    localStorage.setItem('alertConfig', JSON.stringify(alertConfig));
  }, [user, isOnboardingComplete, redeemedCodes, savedPlaces, alertConfig]);

  const updateUser = (userData: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) {
        return { 
          id: uuidv4(), 
          name: '', 
          hasRespiratoryIssues: false, 
          sensitivityLevel: 'medium',
          airCredits: 24, // Initial credits
          lastCreditRefresh: new Date().toISOString(),
          ...userData 
        };
      }
      return { ...prev, ...userData };
    });
  };

  const setHomeLocation = (location: Location) => {
    updateUser({ homeLocation: location });
  };

  const completeOnboarding = () => {
    setIsOnboardingComplete(true);
  };

  const resetOnboarding = () => {
    setIsOnboardingComplete(false);
    localStorage.removeItem('user');
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('redeemedCodes');
    localStorage.removeItem('savedPlaces');
    localStorage.removeItem('alertConfig');
    setUser(null);
    setRedeemedCodes([]);
    setSavedPlaces([]);
    setAlertConfig(defaultAlertConfig);
  };

  const saveRoute = (route: Omit<SavedRoute, 'id'>) => {
    const newRoute: SavedRoute = {
      ...route,
      id: uuidv4(),
    };
    
    updateUser({
      preferredRoutes: [...(user?.preferredRoutes || []), newRoute]
    });
  };

  const deleteRoute = (routeId: string) => {
    if (user?.preferredRoutes) {
      updateUser({
        preferredRoutes: user.preferredRoutes.filter(route => route.id !== routeId)
      });
    }
  };

  const addSavedPlace = (place: Omit<SavedPlace, 'id'>) => {
    const newPlace: SavedPlace = { ...place, id: uuidv4() };
    setSavedPlaces(prev => [...prev, newPlace]);
  };

  const removeSavedPlace = (placeId: string) => {
    setSavedPlaces(prev => prev.filter(p => p.id !== placeId));
  };

  const updateSavedPlace = (placeId: string, data: Partial<SavedPlace>) => {
    setSavedPlaces(prev => prev.map(p => p.id === placeId ? { ...p, ...data } : p));
  };

  const updateAlertConfig = (config: Partial<AQAlertConfig>) => {
    setAlertConfig(prev => ({ ...prev, ...config }));
  };

  const redeemPromoCode = (code: string): { success: boolean; message: string; credits?: number } => {
    if (!user) {
      return { success: false, message: "Please sign in to redeem promo codes" };
    }

    if (redeemedCodes.includes(code.toUpperCase())) {
      return { success: false, message: "This promo code has already been redeemed" };
    }

    const promoCode = validateAndRedeemCode(code);
    if (!promoCode) {
      return { success: false, message: "Invalid or inactive promo code" };
    }

    // Add credits to user's account
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        airCredits: prev.airCredits + promoCode.credits
      };
    });

    // Add code to redeemed codes
    setRedeemedCodes(prev => [...prev, code.toUpperCase()]);

    return { 
      success: true, 
      message: `Successfully redeemed ${promoCode.credits} air credits!`,
      credits: promoCode.credits
    };
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isOnboardingComplete, 
      updateUser, 
      setHomeLocation,
      completeOnboarding,
      resetOnboarding,
      saveRoute,
      deleteRoute,
      useAirCredits,
      getAvailableCredits,
      redeemPromoCode,
      redeemedCodes,
      savedPlaces,
      addSavedPlace,
      removeSavedPlace,
      updateSavedPlace,
      alertConfig,
      updateAlertConfig,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
