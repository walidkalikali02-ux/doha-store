import {useState, useCallback, useEffect} from 'react';
import {AuthContext, RegisterData} from './authContextDef';
import type {User} from '@/types';
import {supabase} from '@/lib/supabase';

export {AuthContext} from './authContextDef';
export type {AuthContextType, RegisterData} from './authContextDef';

const ADMIN_EMAIL = 'walidkalikali02@gmail.com';

function resolveRole(email: string, role?: string) {
  if (email.toLowerCase() === ADMIN_EMAIL) {
    return 'admin';
  }
  return role || 'guest';
}

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: {session},
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: resolveRole(session.user.email || '', session.user.user_metadata?.role),
          emailVerified: session.user.email_confirmed_at != null,
          status: 'active',
          firstName: session.user.user_metadata?.first_name || '',
          lastName: session.user.user_metadata?.last_name || '',
          phone: session.user.user_metadata?.phone,
          createdAt: session.user.created_at,
          updatedAt: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    };

    getSession();

    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: resolveRole(session.user.email || '', session.user.user_metadata?.role),
          emailVerified: session.user.email_confirmed_at != null,
          status: 'active',
          firstName: session.user.user_metadata?.first_name || '',
          lastName: session.user.user_metadata?.last_name || '',
          phone: session.user.user_metadata?.phone,
          createdAt: session.user.created_at,
          updatedAt: new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const {error} = await supabase.auth.signInWithPassword({email, password});
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const {error} = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
