// Stub for Supabase server - replaced with Firebase
// This file exists only to prevent build errors during static export

export const createClient = () => {
  console.warn('Supabase server client called but Firebase should be used instead');
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
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      exchangeCodeForSession: () => Promise.resolve({ data: null, error: new Error('Use Firebase instead') })
    }
  };
};