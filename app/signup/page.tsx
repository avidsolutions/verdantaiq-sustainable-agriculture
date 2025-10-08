
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata = {
  title: 'Sign Up - Peoria Platform',
  description: 'Create your sustainable agriculture account'
}

export default async function SignupPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return <SignupForm />
}
