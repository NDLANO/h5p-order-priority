import React, { useContext } from 'react';

const OrderPriorityContext = React.createContext();

const OrderPriorityProvider = ({ children, value }) => {
  return (
    <OrderPriorityContext.Provider value={value}>
      {children}
    </OrderPriorityContext.Provider>
  );
};

const useOrderPriority = () => {
  const context = useContext(OrderPriorityContext);

  if ( context === undefined) {
    throw new Error(
      'useOrderPriority must be used within a OrderPriorityProvider'
    );
  }

  return context;
};

export {
  OrderPriorityProvider,
  useOrderPriority,
};
