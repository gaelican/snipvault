import { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { serverAuth } from '@/lib/auth/supabase-auth'

export const metadata: Metadata = {
  title: 'Sign Up - SnipVault',
  description: 'Create a new SnipVault account',
}

export default async function SignUpPage() {
  // Redirect if already authenticated
  await serverAuth.requireNoAuth()

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <AuthForm type="signup" />
    </div>
  )
}