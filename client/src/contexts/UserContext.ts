import React from 'react';

export interface UserContextType {
  user: {
    id?: string;
    nome?: string;
    email?: string;
    foto?: string;
    role?: string;
    lojaId?: string;
  } | null;
}

export const UserContext = React.createContext<UserContextType | undefined>(undefined);
