
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Login - Peoria Platform',
  description: 'Sign in to your sustainable agriculture platform'
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
