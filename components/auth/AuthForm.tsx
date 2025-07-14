'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Github, Mail } from 'lucide-react'
import { signIn, signUp, resetPassword, signInWithOAuth } from '@/lib/firebase/auth'
import { toast } from 'sonner'

interface AuthFormProps {
  type: 'login' | 'signup' | 'forgot-password'
  redirectTo?: string
}

export function AuthForm({ type, redirectTo = '/dashboard' }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (type === 'login') {
        const { user, error } = await signIn(email, password)
        
        if (error) {
          toast.error(error)
        } else {
          toast.success('Logged in successfully!')
          router.push(redirectTo)
          router.refresh()
        }
      } else if (type === 'signup') {
        const { user, error } = await signUp(email, password, fullName)
        
        if (error) {
          toast.error(error)
        } else {
          toast.success('Account created! Check your email to verify your account.')
        }
      } else if (type === 'forgot-password') {
        const { error } = await resetPassword(email)
        
        if (error) {
          toast.error(error)
        } else {
          toast.success('Check your email for password reset instructions!')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        setIsGoogleLoading(true)
      } else {
        setIsGithubLoading(true)
      }

      const { user, error } = await signInWithOAuth(provider)
      
      if (error) {
        toast.error(error)
      } else {
        toast.success('Logged in successfully!')
        router.push(redirectTo)
        router.refresh()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsGoogleLoading(false)
      setIsGithubLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {type === 'login' && 'Welcome back'}
          {type === 'signup' && 'Create an account'}
          {type === 'forgot-password' && 'Reset your password'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {type === 'login' && 'Enter your credentials to access your account'}
          {type === 'signup' && 'Get started with SnipVault'}
          {type === 'forgot-password' && "We'll send you a reset link"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {type === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={type === 'signup'}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {type !== 'forgot-password' && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
        )}

        {type === 'login' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/80"
              >
                Forgot password?
              </a>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isGoogleLoading || isGithubLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {type === 'login' && 'Sign in'}
          {type === 'signup' && 'Create account'}
          {type === 'forgot-password' && 'Send reset link'}
        </Button>

        {type !== 'forgot-password' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading || isGoogleLoading || isGithubLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading || isGoogleLoading || isGithubLoading}
              >
                {isGithubLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
            </div>
          </>
        )}

        <div className="text-center text-sm">
          {type === 'login' && (
            <>
              Don't have an account?{' '}
              <a
                href="/signup"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up
              </a>
            </>
          )}
          {type === 'signup' && (
            <>
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </a>
            </>
          )}
          {type === 'forgot-password' && (
            <>
              Remember your password?{' '}
              <a
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Back to login
              </a>
            </>
          )}
        </div>
      </form>
    </div>
  )
}