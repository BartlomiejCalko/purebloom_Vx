import React, { createContext, useContext, useState } from "react";

interface EmotionalState {
    intensity: number;  // 0-1 (Low -> High)
    valence: number;    // 0-1 (Pleasant -> Unpleasant)
    heaviness: number;  // 0-1 (Light -> Heavy)
    stability: number;  // 0-1 (Stable -> Chaotic)
    energy: number;     // 0-1 (Low -> High)
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
    // Default calm, stable state for initial app experience
    const [state, setState] = useState<EmotionalState>({
        intensity: 0.4,      // Medium-low intensity
        valence: 0.3,        // Slightly pleasant (warm gradient)
        heaviness: 0.4,      // Slightly light (gentle upward drift)
        stability: 0.1,      // Very stable (minimal chaos)
        energy: 0.15,        // Low energy (slow, calm movement)
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
