export {}

// Create a type for the roles
export type Roles = 'teacher' | 'student' | 'admin'

// Forum types
export interface ForumPost {
  _id: string
  title: string
  content: string
  category: string
  authorId: {
    _id: string
    name: string
    email: string
  } | null
  likes: string[]
  replyCount: number
  createdAt: string
  updatedAt: string
}

export interface ForumReply {
  _id: string
  postId: string
  content: string
  authorId: {
    _id: string
    name: string
    email: string
  } | null
  likes: string[]
  createdAt: string
  updatedAt: string
}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}