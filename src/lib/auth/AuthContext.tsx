'use client';
// ============================================================
// AuthContext.tsx — IIN-based auth with Supabase integration
// Supports roles: 'patient' (adult) & 'caregiver' (parent/guardian)
// Seamlessly syncs with Supabase database when configured
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PatientProfile, UserRole } from '../store';
import { getSupabase, isSupabaseConfigured } from '../supabase/client';

export interface Account {
  iin: string;
  passwordHash: string;
  patient: PatientProfile;
  onboardingComplete: boolean;
  createdAt: string;
  supabaseUserId?: string;
}

interface AuthContextValue {
  account: Account | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  isCaregiver: boolean;
  isSupabaseConnected: boolean;
  login: (iin: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (iin: string, password: string, role?: UserRole) => Promise<{ ok: boolean; error?: string }>;
  completeOnboarding: (patient: PatientProfile) => Promise<void>;
  updatePatient: (updates: Partial<PatientProfile>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  account: null,
  isLoading: true,
  isOnboardingComplete: false,
  isCaregiver: false,
  isSupabaseConnected: false,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  completeOnboarding: async () => {},
  updatePatient: async () => {},
  logout: () => {},
});

const ACCOUNTS_KEY = 'haemohelp_accounts';
const SESSION_KEY  = 'haemohelp_session_iin';

const hashPassword = (pw: string) => btoa(encodeURIComponent(pw));

function loadAccounts(): Record<string, Account> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, Account>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const iin = localStorage.getItem(SESSION_KEY);
    if (iin) {
      const accounts = loadAccounts();
      if (accounts[iin]) setAccount(accounts[iin]);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (iin: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!/^\d{12}$/.test(iin)) return { ok: false, error: 'auth_error_iin' };
    if (password.length < 4)   return { ok: false, error: 'auth_error_password' };

    const accounts = loadAccounts();
    const acc = accounts[iin];

    // If Supabase is configured, also attempt to fetch/sync profile from Supabase
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        const { data: dbProfile, error: dbError } = await supabase
          .from('profiles')
          .select('*')
          .eq('iin', iin)
          .maybeSingle();

        if (dbProfile && !dbError) {
          // Sync DB data into account
          console.log('[HaemoHelp] Found profile in Supabase for IIN:', iin);
        }
      } catch (err) {
        console.warn('[HaemoHelp] Supabase login sync notice:', err);
      }
    }

    if (!acc) return { ok: false, error: 'auth_error_not_found' };
    if (acc.passwordHash !== hashPassword(password)) return { ok: false, error: 'auth_error_wrong_password' };

    localStorage.setItem(SESSION_KEY, iin);
    setAccount(acc);
    return { ok: true };
  }, []);

  const register = useCallback(async (iin: string, password: string, role: UserRole = 'patient'): Promise<{ ok: boolean; error?: string }> => {
    if (!/^\d{12}$/.test(iin)) return { ok: false, error: 'auth_error_iin' };
    if (password.length < 4)   return { ok: false, error: 'auth_error_password' };

    const accounts = loadAccounts();
    if (accounts[iin]) return { ok: false, error: 'Аккаунт с этим ИИН уже существует' };

    const blankPatient: PatientProfile = {
      role,
      fullName: '',
      caregiverName: role === 'caregiver' ? '' : undefined,
      dob: '',
      bloodType: '',
      hemophiliaType: 'A',
      severity: 'severe',
      inhibitor: false,
      workingDose: '',
      factorProduct: '',
      doctor: '',
      hospital: '',
      weight: 70,
      contacts: [],
    };

    const newAccount: Account = {
      iin,
      passwordHash: hashPassword(password),
      patient: blankPatient,
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
    };

    // If Supabase configured, create profile row in Supabase
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert({
            iin,
            role,
            full_name: 'Новый пользователь',
            dob: '2000-01-01',
            weight_kg: 70,
            blood_type: 'A(II) Rh+',
            hemo_type: 'A',
            severity: 'severe',
            inhibitor: false,
          }, { onConflict: 'iin' });

        if (insertError) {
          console.warn('[HaemoHelp] Supabase profile register notice:', insertError.message);
        } else {
          console.log('[HaemoHelp] Profile created in Supabase for IIN:', iin);
        }
      } catch (err) {
        console.warn('[HaemoHelp] Supabase network error on registration:', err);
      }
    }

    accounts[iin] = newAccount;
    saveAccounts(accounts);
    localStorage.setItem(SESSION_KEY, iin);
    setAccount(newAccount);
    return { ok: true };
  }, []);

  const completeOnboarding = useCallback(async (patient: PatientProfile) => {
    const iin = localStorage.getItem(SESSION_KEY);
    if (!iin) return;

    const accounts = loadAccounts();
    if (!accounts[iin]) return;

    const updated: Account = { ...accounts[iin], patient, onboardingComplete: true };
    accounts[iin] = updated;
    saveAccounts(accounts);
    setAccount(updated);

    // Sync to Supabase
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            iin,
            role: patient.role || 'patient',
            full_name: patient.fullName,
            caregiver_name: patient.caregiverName,
            dob: patient.dob || '2000-01-01',
            weight_kg: patient.weight,
            blood_type: patient.bloodType,
            hemo_type: patient.hemophiliaType,
            severity: patient.severity,
            inhibitor: patient.inhibitor,
            working_dose: patient.workingDose,
            factor_product: patient.factorProduct,
            doctor: patient.doctor,
            hospital: patient.hospital,
            emergency_contacts: patient.contacts,
            avatar: patient.avatar || '🧑',
            social_nickname: patient.socialNickname,
          }, { onConflict: 'iin' });
      } catch (err) {
        console.warn('[HaemoHelp] Failed to sync onboarding to Supabase:', err);
      }
    }
  }, []);

  const updatePatient = useCallback(async (updates: Partial<PatientProfile>) => {
    const iin = localStorage.getItem(SESSION_KEY);
    if (!iin) return;

    const accounts = loadAccounts();
    if (!accounts[iin]) return;

    const currentPatient = accounts[iin].patient;
    const updatedPatient: PatientProfile = { ...currentPatient, ...updates };
    const updatedAccount: Account = { 
      ...accounts[iin], 
      patient: updatedPatient 
    };
    
    accounts[iin] = updatedAccount;
    saveAccounts(accounts);
    setAccount(updatedAccount);

    // Sync updates to Supabase
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updatedPatient.fullName,
            caregiver_name: updatedPatient.caregiverName,
            weight_kg: updatedPatient.weight,
            working_dose: updatedPatient.workingDose,
            factor_product: updatedPatient.factorProduct,
            doctor: updatedPatient.doctor,
            hospital: updatedPatient.hospital,
            emergency_contacts: updatedPatient.contacts,
            avatar: updatedPatient.avatar,
            social_nickname: updatedPatient.socialNickname,
          })
          .eq('iin', iin);
      } catch (err) {
        console.warn('[HaemoHelp] Failed to sync profile updates to Supabase:', err);
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setAccount(null);
  }, []);

  const isCaregiver = account?.patient?.role === 'caregiver';

  return (
    <AuthContext.Provider value={{
      account,
      isLoading,
      isOnboardingComplete: account?.onboardingComplete ?? false,
      isCaregiver,
      isSupabaseConnected: isSupabaseConfigured,
      login,
      register,
      completeOnboarding,
      updatePatient,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
