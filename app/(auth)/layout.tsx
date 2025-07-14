export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-grid-gray-100/[0.03] dark:bg-grid-gray-700/[0.03]" />
      <div className="relative">
        {children}
      </div>
    </div>
  )
}