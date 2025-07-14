import { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { serverAuth } from '@/lib/auth/supabase-auth'

export const metadata: Metadata = {
  title: 'Reset Password - SnipVault',
  description: 'Reset your SnipVault account password',
}

export default async function ForgotPasswordPage() {
  // Redirect if already authenticated
  await serverAuth.requireNoAuth()

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <AuthForm type="forgot-password" />
    </div>
  )
}