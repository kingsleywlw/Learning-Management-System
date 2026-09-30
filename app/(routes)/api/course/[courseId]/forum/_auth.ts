import { currentUser } from '@clerk/nextjs/server'
import connectMongoDB from '@/db/connectMongoDB'
import User from '@/models/user'
import Course from '@/models/course'

function idsEqual(a: any, b: any) {
  return String(a) === String(b)
}

export async function requireCourseAccess(courseIdStr: string) {
  await connectMongoDB()

  // 1) Who is logged in?
  const cu = await currentUser()
  if (!cu) return { ok: false, status: 401 as const, msg: 'Unauthorized' }

  // 2) Find our app user by Clerk id
  const dbUser = await User.findOne({ clerkId: cu.id })
  if (!dbUser) return { ok: false, status: 404 as const, msg: 'User not found' }

  // 3) Find the course by its code (e.g., "CS101")
  //    Select all possible membership fields to be safe across schemas
  const course = await Course.findOne({ courseId: courseIdStr })
    .select('_id courseId teachers courseDirectorId enrolledStudents enrolledStudentIds')
  if (!course) return { ok: false, status: 404 as const, msg: 'Course not found' }

  // 4) Normalize possible teacher/enrollment fields
  const teacherIds: any[] = []
  if (Array.isArray(course.teachers)) teacherIds.push(...course.teachers)
  if (course.courseDirectorId) teacherIds.push(course.courseDirectorId)

  const enrolledIds: any[] = []
  if (Array.isArray(course.enrolledStudents)) enrolledIds.push(...course.enrolledStudents)
  if (Array.isArray(course.enrolledStudentIds)) enrolledIds.push(...course.enrolledStudentIds)

  // Some installs store course membership on the user instead
  const userCourseIds: any[] = Array.isArray((dbUser as any).enrolledCourseIds)
    ? (dbUser as any).enrolledCourseIds
    : []

  // 5) Compute access
  const dbUserId = String(dbUser._id)
  const isTeacher =
    teacherIds.some(t => idsEqual(t, dbUserId))

  const isStudent =
    enrolledIds.some(s => idsEqual(s, dbUserId)) ||
    userCourseIds.some(cid => idsEqual(cid, course._id))

  if (!isTeacher && !isStudent) {
    return { ok: false, status: 403 as const, msg: 'Access denied' }
  }

  return { ok: true, cu, dbUser, course }
}
