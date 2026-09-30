import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/actions/user.action'
import { assignRole } from '@/actions/assignRole.action'


export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    // CREAT User in mongodb
    if (eventType === 'user.created') {
        const {id, email_addresses, first_name, last_name, created_at} = evt.data
        const user = {

            clerkId: id,
            email: email_addresses[0].email_address,
            name: `${first_name} ${last_name}`,
            dateEnrolled: created_at,
        }
        //mongo db
        const newUser = await createUser(user);
    }

    return NextResponse.json({message: 'Webhook received'});
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}