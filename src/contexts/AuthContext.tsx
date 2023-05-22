import { ActorSubclass, Identity } from '@dfinity/agent'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import React, { useContext, useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { canisterId, createActor } from '../declarations/studentWallBackend'
import {
  _SERVICE,
  StudentProfile,
  StudentProfileResult
} from '../declarations/studentWallBackend/studentWallBackend.did'

const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableIdle: true
    }
  },
  loginOptions: {
    identityProvider:
      process.env.DFX_NETWORK === 'ic'
        ? 'https://identity.ic0.app/#authorize'
        : `http://localhost:4943?canisterId=${
            import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY
          }#authorize`
  }
}

export interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  authClient: AuthClient | undefined
  identity: Identity | undefined
  principal: Principal | undefined
  isAnonymous: boolean
  backendActor: ActorSubclass<_SERVICE> | undefined
  profile: StudentProfile | undefined
}

const AuthContext = React.createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authClient, setAuthClient] = useState<AuthClient>()
  const [identity, setIdentity] = useState<Identity>()
  const [principal, setPrincipal] = useState<Principal>()
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true)
  const [backendActor, setBackendActor] = useState<ActorSubclass<_SERVICE>>()
  const [profile, setProfile] = useState<StudentProfile>()
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  // Initialize AuthClient
  useEffect(() => {
    setIsAuthenticating(true)
    setIsAnonymous(false)
    initializeAuthClient()
  }, [])

  const initializeAuthClient = async () => {
    const authClient = await AuthClient.create(defaultOptions.createOptions)
    handleAuthenticated(authClient)
  }

  const login = () => {
    if (authClient == null) return
    authClient.login({
      ...defaultOptions.loginOptions,
      onSuccess: () => {
        handleAuthenticated(authClient)
      }
    })
  }

  async function handleAuthenticated (client: AuthClient) {
    console.log('updateClient')
    const isAuthenticated = await client.isAuthenticated()
    setIsAuthenticated(isAuthenticated)

    const identity = client.getIdentity()
    setIdentity(identity)

    const principal = identity.getPrincipal()
    setPrincipal(principal)
    setIsAnonymous(principal.isAnonymous())
    setAuthClient(client)

    const actor = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    setBackendActor(actor)

    const myProfile: StudentProfileResult = await actor.seeMyProfile()
    'ok' in myProfile ? setProfile(myProfile.ok) : setProfile(undefined)

    setIsAuthenticating(false)
  }

  async function logout () {
    if (authClient == null) return
    await authClient.logout()
    await handleAuthenticated(authClient)
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
    profile
  }

  return (
    <AuthContext.Provider value={value}>
      {!isAuthenticating && <Outlet />}
    </AuthContext.Provider>
  )
}
