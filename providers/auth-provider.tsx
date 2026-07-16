"use client";

import { createContext, useContext } from "react";
import type { RecordModel } from "pocketbase";

const AuthContext = createContext<{
    getCurrentUserPromise: Promise<RecordModel | null>;
} | null>(null);

function AuthProvider({
    getCurrentUserPromise,
    children,
}: {
    getCurrentUserPromise: Promise<RecordModel | null>;
    children: React.ReactNode;
}) {
    return (
        <AuthContext.Provider value={{ getCurrentUserPromise }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export { AuthContext, AuthProvider, useAuth };
