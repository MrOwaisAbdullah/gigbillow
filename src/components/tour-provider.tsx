
'use client';

import { createContext, useContext, useState } from 'react';

type TourContextType = {
  isTourOpen: boolean;
  setOpen: (open: boolean) => void;
};

const TourContext = createContext<TourContextType>({
  isTourOpen: false,
  setOpen: () => {},
});

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <TourContext.Provider value={{ isTourOpen, setOpen: setIsTourOpen }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
