import Link from 'next/link'
import { ArrowRight, Code2, Lock, Zap, Share2, Cloud, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
              Store, organize, and share your code snippets
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              SnipVault is the modern solution for developers to manage their code snippets. 
              Save time, boost productivity, and never lose a piece of code again.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Get started free
                <ArrowRight className="ml-2 inline-block h-4 w-4" />
              </Link>
              <Link 
                href="/demo" 
                className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100"
              >
                Live demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-slate-600 dark:text-slate-400">
              Everything you need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Powerful features for modern developers
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                    <Code2 className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  Syntax Highlighting
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Support for 100+ programming languages with beautiful syntax highlighting and auto-detection.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                    <Lock className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  Private & Public Snippets
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Keep your snippets private or share them with the world. Full control over visibility.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                    <Zap className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  Lightning Fast Search
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Find any snippet in milliseconds with our powerful search engine. Search by title, tags, or content.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                    <Share2 className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  Easy Sharing
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Share snippets with a simple link. Embed them in your blog or documentation.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                    <Cloud className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  Cloud Sync
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Access your snippets from anywhere. Automatic sync across all your devices.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-slate-100">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                    <Shield className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  Enterprise Security
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Bank-level encryption, SSO support, and compliance with industry standards.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 dark:bg-slate-100">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white dark:text-slate-900 sm:text-4xl">
              Ready to boost your productivity?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300 dark:text-slate-700">
              Join thousands of developers who are already using SnipVault to manage their code snippets efficiently.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                Start free trial
              </Link>
              <Link 
                href="/pricing" 
                className="text-sm font-semibold leading-6 text-white dark:text-slate-900"
              >
                View pricing <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}