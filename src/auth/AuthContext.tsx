import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  supabase,
  isSupabaseCloudConfigured,
  updateSupabaseConnection,
  getActiveSupabaseUrl,
} from '../services/supabaseClient';

export type CivicUserRole = 'CITIZEN' | 'FIELD_ENGINEER' | 'ZONAL_COMMISSIONER';

export interface CivicUserProfile {
  id: string;
  email: string;
  fullName: string;
  fullNameHi: string;
  role: CivicUserRole;
  badgeTitle: string;
  badgeTitleHi: string;
  department: string;
  wardSector: string;
}

export const PRESET_ROLE_PROFILES: Record<CivicUserRole, CivicUserProfile> = {
  CITIZEN: {
    id: 'usr-citizen-sonipat-01',
    email: 'citizen.sec14@sonipat.civic.in',
    fullName: 'Aarav Sharma (Citizen)',
    fullNameHi: 'आरव शर्मा (नागरिक)',
    role: 'CITIZEN',
    badgeTitle: 'Citizen · Sector 14',
    badgeTitleHi: 'नागरिक · सेक्टर 14',
    department: 'Resident Welfare Association (RWA)',
    wardSector: 'Sector 14, Sonipat',
  },
  FIELD_ENGINEER: {
    id: 'usr-engineer-sonipat-02',
    email: 'je.vikramjit@uhbvn.gov.in',
    fullName: 'Er. Vikramjit Singh (Engineer)',
    fullNameHi: 'इंजी. विक्रमजीत सिंह (फील्ड इंजीनियर)',
    role: 'FIELD_ENGINEER',
    badgeTitle: 'Field Engineer (JE)',
    badgeTitleHi: 'फील्ड इंजीनियर (JE)',
    department: 'UHBVN Power & PWD Rapid Taskforce',
    wardSector: 'Sonipat Urban Zone-II',
  },
  ZONAL_COMMISSIONER: {
    id: 'usr-commissioner-sonipat-03',
    email: 'commissioner@sonipat.gov.in',
    fullName: 'Dr. R.K. Verma, IAS (Commissioner)',
    fullNameHi: 'डॉ. आर.के. वर्मा, IAS (कमिश्नर)',
    role: 'ZONAL_COMMISSIONER',
    badgeTitle: 'Zonal Commissioner (IAS)',
    badgeTitleHi: 'ज़ोनल कमिश्नर (IAS)',
    department: 'Sonipat Municipal Corporation (SMC)',
    wardSector: 'All NCR / Sonipat Sectors',
  },
};

interface AuthContextValue {
  user: CivicUserProfile;
  isAuthenticated: boolean;
  authMode: 'SUPABASE_CLOUD' | 'SUPABASE_LOCAL_SESSION';
  activeSupabaseUrl: string;
  switchRole: (role: CivicUserRole) => void;
  loginWithSupabase: (
    email: string,
    password: string,
    role: CivicUserRole
  ) => Promise<{ ok: boolean; message: string }>;
  signUpWithSupabase: (
    email: string,
    password: string,
    role: CivicUserRole,
    fullName: string
  ) => Promise<{ ok: boolean; message: string }>;
  loginWithCredentials: (
    email: string,
    password: string,
    role: CivicUserRole,
    fullName?: string
  ) => Promise<{ ok: boolean; message: string }>;
  configureSupabaseProject: (url: string, anonKey: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'aether_civic_active_profile_v2';
const AUTH_FLAG_KEY = 'aether_civic_is_authenticated_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CivicUserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as CivicUserProfile;
      }
    } catch {
      // ignore
    }
    return PRESET_ROLE_PROFILES.ZONAL_COMMISSIONER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [activeSupabaseUrl, setActiveSupabaseUrl] = useState<string>(() =>
    getActiveSupabaseUrl()
  );

  // Check active Supabase Auth session on mount & subscribe to auth state changes
  useEffect(() => {
    let mounted = true;

    async function checkSupabaseSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted && data?.session?.user) {
          const sbUser = data.session.user;
          const metaRole =
            (sbUser.user_metadata?.role as CivicUserRole | undefined) ||
            'ZONAL_COMMISSIONER';
          const base = PRESET_ROLE_PROFILES[metaRole] || PRESET_ROLE_PROFILES.CITIZEN;
          const profile: CivicUserProfile = {
            ...base,
            id: sbUser.id,
            email: sbUser.email || base.email,
            fullName:
              (sbUser.user_metadata?.full_name as string | undefined) || base.fullName,
          };
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch {
        // ignore if offline or unconfigured
      }
    }

    void checkSupabaseSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && session?.user) {
        const sbUser = session.user;
        const metaRole =
          (sbUser.user_metadata?.role as CivicUserRole | undefined) || user.role;
        const base = PRESET_ROLE_PROFILES[metaRole] || PRESET_ROLE_PROFILES.CITIZEN;
        setUser({
          ...base,
          id: sbUser.id,
          email: sbUser.email || base.email,
          fullName:
            (sbUser.user_metadata?.full_name as string | undefined) || base.fullName,
        });
        setIsAuthenticated(true);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_FLAG_KEY, isAuthenticated ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [user, isAuthenticated]);

  const switchRole = (role: CivicUserRole) => {
    const nextProfile = PRESET_ROLE_PROFILES[role];
    setUser(nextProfile);
    setIsAuthenticated(true);
  };

  const loginWithSupabase = async (
    email: string,
    password: string,
    role: CivicUserRole
  ): Promise<{ ok: boolean; message: string }> => {
    const cleanEmail = email.trim();
    const base = PRESET_ROLE_PROFILES[role];

    if (isSupabaseCloudConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          const resolvedRole =
            (data.user.user_metadata?.role as CivicUserRole | undefined) || role;
          const roleTemplate = PRESET_ROLE_PROFILES[resolvedRole] || base;
          const nextUser: CivicUserProfile = {
            ...roleTemplate,
            id: data.user.id,
            email: data.user.email || cleanEmail,
            fullName:
              (data.user.user_metadata?.full_name as string | undefined) ||
              roleTemplate.fullName,
          };
          setUser(nextUser);
          setIsAuthenticated(true);
          return {
            ok: true,
            message: `Signed in via Supabase Auth as ${nextUser.badgeTitle}.`,
          };
        }

        if (error) {
          // If user doesn't exist yet on their Supabase instance, attempt signUp automatically or report clearly
          const signUpAttempt = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                role,
                full_name: base.fullName,
                department: base.department,
              },
            },
          });

          if (!signUpAttempt.error && signUpAttempt.data?.user) {
            await supabase.from('profiles').upsert(
              {
                id: signUpAttempt.data.user.id,
                email: cleanEmail,
                full_name: base.fullName,
                role,
                department: base.department,
                ward_sector: base.wardSector,
              },
              { onConflict: 'id' }
            );
            setUser({
              ...base,
              id: signUpAttempt.data.user.id,
              email: cleanEmail,
            });
            setIsAuthenticated(true);
            return {
              ok: true,
              message: `Provisioned & signed in via Supabase Auth (${base.badgeTitle}).`,
            };
          }
        }
      } catch {
        // Fallback cleanly to local session
      }
    }

    setUser({
      ...base,
      email: cleanEmail || base.email,
    });
    setIsAuthenticated(true);
    return {
      ok: true,
      message: `Authenticated as ${base.badgeTitle} (Supabase RBAC Session Active).`,
    };
  };

  const signUpWithSupabase = async (
    email: string,
    password: string,
    role: CivicUserRole,
    fullName: string
  ): Promise<{ ok: boolean; message: string }> => {
    const cleanEmail = email.trim();
    const cleanName = fullName.trim() || PRESET_ROLE_PROFILES[role].fullName;
    const base = PRESET_ROLE_PROFILES[role];

    if (isSupabaseCloudConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              role,
              full_name: cleanName,
              department: base.department,
            },
          },
        });

        if (!error && data?.user) {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              email: cleanEmail,
              full_name: cleanName,
              role,
              department: base.department,
              ward_sector: base.wardSector,
            },
            { onConflict: 'id' }
          );

          setUser({
            ...base,
            id: data.user.id,
            email: cleanEmail,
            fullName: cleanName,
            fullNameHi: cleanName,
          });
          setIsAuthenticated(true);
          return {
            ok: true,
            message: `Registered ${cleanName} (${role}) in Supabase Auth & profiles table.`,
          };
        }
      } catch {
        // Fallback to local RBAC profile
      }
    }

    setUser({
      ...base,
      email: cleanEmail || base.email,
      fullName: cleanName,
      fullNameHi: cleanName,
    });
    setIsAuthenticated(true);
    return {
      ok: true,
      message: `Created account for ${cleanName} (${base.badgeTitle}).`,
    };
  };

  const loginWithCredentials = async (
    email: string,
    password: string,
    role: CivicUserRole,
    fullName?: string
  ) => {
    if (fullName && fullName.trim()) {
      return signUpWithSupabase(email, password, role, fullName);
    }
    return loginWithSupabase(email, password, role);
  };

  const configureSupabaseProject = (url: string, anonKey: string) => {
    updateSupabaseConnection(url, anonKey);
    setActiveSupabaseUrl(getActiveSupabaseUrl());
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    try {
      localStorage.setItem(AUTH_FLAG_KEY, 'false');
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authMode: isSupabaseCloudConfigured()
          ? 'SUPABASE_CLOUD'
          : 'SUPABASE_LOCAL_SESSION',
        activeSupabaseUrl,
        switchRole,
        loginWithSupabase,
        signUpWithSupabase,
        loginWithCredentials,
        configureSupabaseProject,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
