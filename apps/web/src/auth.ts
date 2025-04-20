// We're using Clerk for authentication, so we don't need NextAuth
// Export dummy handlers to avoid errors in other parts of the app that might import this

export const handlers = {
  GET: async () => new Response('Using Clerk instead', { status: 200 }),
  POST: async () => new Response('Using Clerk instead', { status: 200 }),
};

export const auth = async () => ({ user: null });
export const signIn = async () => ({ url: '/login' });
export const signOut = async () => ({ url: '/login' });
