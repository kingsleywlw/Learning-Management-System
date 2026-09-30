import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12 -mt-18">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src="/lms-background.png"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />

          <div className="hidden lg:relative lg:block lg:p-12">

            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl flex items-center gap-2">
              Welcome to Matask <span role="img" aria-label="book">📚</span>
            </h2>

            <p className="mt-4 leading-relaxed text-white/90">
              Matask is your all-in-one Learning Management System for students and teachers. Easily manage courses, track progress, and collaborate in a modern, user-friendly environment.
            </p>
          </div>
        </section>

        <main
          className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6"
        >
          <div className="max-w-xl lg:max-w-3xl">
            <div className="relative -mt-16 block lg:hidden">

              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl flex items-center gap-2">
                Welcome to Matask <span role="img" aria-label="book">📚</span>
              </h1>

              <p className="mt-4 leading-relaxed text-gray-500">
                Matask helps you organize, learn, and teach with ease. Access your courses, assignments, and resources—all in one place.
              </p>
            </div>

            <SignIn />
          </div>
        </main>
      </div>
    </section>);
}
