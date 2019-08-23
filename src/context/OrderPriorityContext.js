import React from 'react';

export const OrderPriorityContext = React.createContext({
    params: {},
    behaviour: {},
    id: null,
    language: 'en',
    translations: {},
    registerReset: () => {},
    reset: () => {},
    collectExportValues: () => {},
});
