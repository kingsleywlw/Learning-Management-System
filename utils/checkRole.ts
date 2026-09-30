import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const checkRole = async(role:string) =>{
    const {sessionClaims} = await auth()
    return sessionClaims?.metadata?.role === role
}
