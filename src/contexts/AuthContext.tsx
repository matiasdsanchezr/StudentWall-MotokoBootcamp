import { type ActorSubclass, type Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { type Principal } from '@dfinity/principal';
import React, { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { canisterId, createActor } from '../declarations/studentWallBackend';
import {
  type _SERVICE,
  type StudentProfile,
  type StudentProfileResult,
} from '../declarations/studentWallBackend/studentWallBackend.did';

const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableIdle: true,
    },
  },
  loginOptions: {
    identityProvider:
      process.env.DFX_NETWORK === 'ic'
        ? 'https://identity.ic0.app/#authorize'
        : `http://localhost:4943?canisterId=${
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY
          }#authorize`,
  },
};

export interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  authClient: AuthClient | undefined;
  identity: Identity | undefined;
  principal: Principal | undefined;
  isAnonymous: boolean;
  backendActor: ActorSubclass<_SERVICE> | undefined;
  profile: StudentProfile | undefined;
  refreshProfile: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);

export const useAuth = (): AuthContextType => useContext(AuthContext);

export const AuthProvider = (): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [identity, setIdentity] = useState<Identity>();
  const [principal, setPrincipal] = useState<Principal>();
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [backendActor, setBackendActor] = useState<ActorSubclass<_SERVICE>>();
  const [profile, setProfile] = useState<StudentProfile>();
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Initialize AuthClient
  useEffect(() => {
    setIsAuthenticating(true);
    setIsAnonymous(false);
    void initializeAuthClient();
  }, []);

  const initializeAuthClient = async (): Promise<void> => {
    const authClient = await AuthClient.create(defaultOptions.createOptions);
    await handleAuthenticated(authClient);
  };

  const login = async (): Promise<void> => {
    if (authClient == null) return;
    await authClient.login({
      ...defaultOptions.loginOptions,
      onSuccess: async () => {
        await handleAuthenticated(authClient);
      },
    });
  };

  async function handleAuthenticated(client: AuthClient): Promise<void> {
    console.log('updateClient');
    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);

    const identity = client.getIdentity();
    setIdentity(identity);

    const principal = identity.getPrincipal();
    setPrincipal(principal);
    setIsAnonymous(principal.isAnonymous());
    setAuthClient(client);

    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
    setBackendActor(actor);

    const myProfile: StudentProfileResult = await actor.seeMyProfile();
    'ok' in myProfile ? setProfile(myProfile.ok) : setProfile(undefined);

    setIsAuthenticating(false);
  }

  async function refreshProfile(): Promise<void> {
    const myProfile = await backendActor?.seeMyProfile();
    myProfile != null && 'ok' in myProfile
      ? setProfile(myProfile.ok)
      : setProfile(undefined);
  }

  async function logout(): Promise<void> {
    if (authClient == null) return;
    await authClient.logout();
    await handleAuthenticated(authClient);
  }

  const value = {
    isAuthenticated,
    login,
    logout,
    authClient,
    identity,
    principal,
    isAnonymous,
    backendActor,
    profile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isAuthenticating && <Outlet />}
    </AuthContext.Provider>
  );
};
