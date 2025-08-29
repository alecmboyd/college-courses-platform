import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '0.1.1',
    deploymentTime: new Date().toISOString(),
    authenticationFixed: true,
    commit: '62ab513',
    message: 'Authentication fixes deployed',
    features: [
      'Login/signup flow fixed',
      'Password reset functionality',
      'Database auto-initialization', 
      'Proper post-login redirects'
    ]
  })
}