import React from 'react'
import { Suspense } from 'react'
import { redirectIfiSignIn } from '@/lib/authentication'

async function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  await redirectIfiSignIn()
  return children
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
  <div className="min-h-[100vh] w-full flex flex-col
  items-center justify-center">
    <Suspense fallback={<div role="status">Checking your session...</div>}>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </Suspense>
    </div>
    )
}

export default AuthLayout