import { Toaster } from '@/components/ui/toaster'

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center px-4">
          <a href="/" className="text-xl font-bold text-zinc-900">VetConnect</a>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl px-4 py-12">{children}</main>
      <Toaster />
    </div>
  )
}
