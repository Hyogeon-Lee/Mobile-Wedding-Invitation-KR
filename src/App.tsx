import { MotionConfig } from 'motion/react'
import { ToastProvider } from '@/components/Toast'
import SmoothScroll from '@/components/SmoothScroll'
import { wedding } from '@/config/wedding'
import Cover from '@/sections/Cover'
import Greeting from '@/sections/Greeting'
import Family from '@/sections/Family'
import Calendar from '@/sections/Calendar'
import Gallery from '@/sections/Gallery'
import Location from '@/sections/Location'
import Account from '@/sections/Account'
import Rsvp from '@/sections/Rsvp'
import Guestbook from '@/sections/Guestbook'
import Share from '@/sections/Share'
import Footer from '@/sections/Footer'
import { BotanicalDivider } from '@/effects'

const s = {
  cover: wedding.cover.enabled,
  greeting: wedding.greeting.enabled,
  family: wedding.family.enabled,
  calendar: wedding.calendar.enabled,
  gallery: wedding.gallery.enabled,
  location: wedding.location.enabled,
  account: wedding.account.enabled,
  rsvp: wedding.rsvp.enabled,
  guestbook: wedding.guestbook.enabled,
  share: wedding.share.enabled,
  footer: wedding.footer.enabled,
}

// Sections stay direct children of <main>: the cover's scroll cue targets the next sibling that is not aria-hidden
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <SmoothScroll>
          <main className="app-frame">
            {s.cover && <Cover />}
            {s.greeting && <Greeting />}
            {s.greeting && s.family && <BotanicalDivider variant="sprig" />}
            {s.family && <Family />}
            {s.calendar && <Calendar />}
            {s.gallery && <Gallery />}
            {s.gallery && s.location && <BotanicalDivider variant="leaf" />}
            {s.location && <Location />}
            {s.account && <Account />}
            {s.rsvp && <Rsvp />}
            {s.guestbook && <Guestbook />}
            {s.share && <Share />}
            {s.footer && <Footer />}
          </main>
        </SmoothScroll>
      </ToastProvider>
    </MotionConfig>
  )
}
