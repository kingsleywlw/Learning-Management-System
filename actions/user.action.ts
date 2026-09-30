"use server"

import User from "@/models/user"
import connectMongoDB from "@/db/connectMongoDB";

export async function createUser(user: any){
    try {
        await connectMongoDB();
        const newUser= await User.create(user);
        return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
        console.error('Error creating user:', error);
    }
}
