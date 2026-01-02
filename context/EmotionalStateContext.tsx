import React, { createContext, useContext, useState } from "react";

interface EmotionalState {
    intensity: number;  // 0-1 (Low -> High)
    valence: number;    // 0-1 (Unpleasant -> Pleasant)
    heaviness: number;  // 0-1 (Light -> Heavy)
    chaos: number;      // 0-1 (Stable -> Chaotic)
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
    // Default neutral state
    const [state, setState] = useState<EmotionalState>({
        intensity: 0.5,
        valence: 0.5,
        heaviness: 0.45,
        chaos: 0.3,     // 0=stable, 1=chaotic - default slightly stable
        energy: 0.01,   // 👈 ZMIEŃ TĘ WARTOŚĆ (0.0 - 1.0) aby kontrolować początkową prędkość particles
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
