import React, { useContext } from 'react';

const OrderPriorityContext = React.createContext();

function OrderPriorityProvider({ children, value }) {
  return (
    <OrderPriorityContext.Provider value={value}>
      {children}
    </OrderPriorityContext.Provider>
  );
}

function useOrderPriority() {
  const context = useContext(OrderPriorityContext);
  if ( context === undefined) {
    throw new Error('useOrderPriority must be used within a OrderPriorityProvider');
  }
  return context;
}

export {
  OrderPriorityProvider,
  useOrderPriority,
};
