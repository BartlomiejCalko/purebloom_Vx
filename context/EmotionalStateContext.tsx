import React, { createContext, useContext, useState } from "react";

interface EmotionalState {
    intensity: number;
    energy: number;
    tension: number;
    lastUpdated: Date;
}

interface EmotionalStateContextType {
    state: EmotionalState;
    updateState: (newState: Partial<EmotionalState>) => void;
}

const EmotionalStateContext = createContext<EmotionalStateContextType | undefined>(undefined);

export const useEmotionalState = () => {
    const context = useContext(EmotionalStateContext);
    if (!context) {
        throw new Error("useEmotionalState must be used within an EmotionalStateProvider");
    }
    return context;
};

export const EmotionalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default neutral state
    const [state, setState] = useState<EmotionalState>({
        intensity: 0.5,
        energy: 0.5,
        tension: 0.0,
        lastUpdated: new Date(),
    });

    const updateState = (updates: Partial<EmotionalState>) => {
        setState((prev) => ({
            ...prev,
            ...updates,
            lastUpdated: new Date(),
        }));
    };

    return (
        <EmotionalStateContext.Provider value={{ state, updateState }}>
            {children}
        </EmotionalStateContext.Provider>
    );
};
