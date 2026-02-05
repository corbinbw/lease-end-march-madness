'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setMessage(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Registration failed')
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setMessage('Account created! Please sign in.')
          setIsRegistering(false)
        } else {
          router.push('/')
          router.refresh()
        }
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Navy Hero Card - like leaseend.com style */}
        <div className="hero-card mb-6 text-center">
          <div className="flex items-center justify-center space-x-1 mb-3">
            <span className="text-3xl font-light tracking-tight">LEASE</span>
            <span className="text-3xl font-bold text-gold-400 tracking-tight">END</span>
          </div>
          <div className="inline-flex items-center bg-gold-400 text-navy-900 px-4 py-1.5 rounded-full font-bold text-lg mb-3">
            🏀 MADNESS
          </div>
          <p className="text-navy-200">
            {isRegistering
              ? 'Join 300+ coworkers competing for the perfect bracket!'
              : 'Sign in to compete for the $1,000,000 prize!'}
          </p>
        </div>

        {/* White Form Card */}
        <div className="card p-8">
          <form onSubmit={isRegistering ? handleRegister : handleSignIn} className="space-y-4">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="input"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-1.5">
                Company Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.name@leaseend.com"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading
                ? 'Please wait...'
                : isRegistering
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering)
                setMessage('')
              }}
              className="text-teal-600 dark:text-teal-400 hover:text-teal-500 text-sm font-medium"
            >
              {isRegistering
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register"}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${
              message.includes('success') || message.includes('created')
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-navy-600 dark:text-navy-400">
            Only @leaseend.com emails allowed
          </p>
          <div className="mt-3">
            <Link 
              href="/tv" 
              className="text-teal-600 dark:text-teal-400 hover:text-teal-500 text-sm font-medium"
            >
              View TV Display →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
