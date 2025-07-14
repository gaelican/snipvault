// Stub for Supabase client - replaced with Firebase
export const createClient = () => {
  console.warn('Supabase client called but Firebase should be used instead');
  return {
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: new Error('Use Firebase instead') }),
          data: null,
          error: new Error('Use Firebase instead')
        }),
        data: null,
        error: new Error('Use Firebase instead')
      }),
      insert: () => Promise.resolve({ data: null, error: new Error('Use Firebase instead') }),
      update: () => ({ 
        eq: () => Promise.resolve({ data: null, error: new Error('Use Firebase instead') })
      }),
      delete: () => ({ 
        eq: () => Promise.resolve({ data: null, error: new Error('Use Firebase instead') })
      })
    }),
    auth: {
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      }),
      getSession: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Use Firebase instead') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Use Firebase instead') }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
};