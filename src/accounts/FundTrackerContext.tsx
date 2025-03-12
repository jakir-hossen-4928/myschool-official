// FundTrackerContext.tsx
import { createContext, useContext, useState } from 'react';

const FundTrackerContext = createContext();

export const FundTrackerProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  return (
    <FundTrackerContext.Provider value={{ transactions, addTransaction, setTransactions }}>
      {children}
    </FundTrackerContext.Provider>
  );
};

export const useFundTracker = () => useContext(FundTrackerContext);