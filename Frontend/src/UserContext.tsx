import React, { createContext, useEffect, useState, useContext, Dispatch, SetStateAction, ReactNode } from "react";
import axios from "axios";

type User = any; 

interface UserContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  ready: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  ready: false
});

export function useUser() {
  return useContext(UserContext);
}

export function UserContextProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      axios.get('/profile').then(({data}) => {
        setUser(data);
        setReady(true);
      }).catch(() => {
        setReady(true);
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{user, setUser, ready}}>
      {children}
    </UserContext.Provider>
  );
}
