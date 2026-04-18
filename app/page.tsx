import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, Shield, Video } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-zinc-900">VetConnect</span>
          <Link href="/login">
            <Button variant="outline" size="sm">Vet Login</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900">
            Vet care from the<br />comfort of home
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-500">
            Book a telehealth consultation with a registered veterinarian. No travel, no waiting rooms — just expert advice for your pet.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/book">
              <Button size="lg" className="px-8">Book a Consultation</Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-zinc-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">How it works</h2>
            <div className="grid gap-8 md:grid-cols-4">
              {[
                { icon: CheckCircle, title: 'Fill in details', desc: 'Tell us about you and your pet.' },
                { icon: Clock, title: 'Pick a slot', desc: 'Choose from available appointment times.' },
                { icon: Shield, title: 'Complete payment', desc: 'Secure checkout powered by Stripe.' },
                { icon: Video, title: 'Video consult', desc: 'Meet your vet — from anywhere.' },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-0 shadow-none">
                  <CardContent className="pt-6 text-center">
                    <Icon className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
                    <h3 className="font-semibold text-zinc-900">{title}</h3>
                    <p className="mt-2 text-sm text-zinc-500">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-zinc-400">
        &copy; {new Date().getFullYear()} VetConnect. All rights reserved.
      </footer>
    </div>
  )
}
