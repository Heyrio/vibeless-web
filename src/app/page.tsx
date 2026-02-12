'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const body = isLogin ? { email, password } : { email, password, name }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      localStorage.setItem('vibeless_api_key', data.apiKey)
      localStorage.setItem('vibeless_user', JSON.stringify(data))

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">Vibeless</h1>
          <p className="text-slate-400 text-sm mt-1">AI coding companion</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-white">
              {isLogin ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isLogin ? 'Sign in to your account' : 'Get started with Vibeless'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-600"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-600"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-slate-400 hover:text-white transition"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
