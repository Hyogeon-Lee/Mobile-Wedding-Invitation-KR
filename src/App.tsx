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

// Page order. Sections stay direct children of <main>; the cover's scroll cue targets the next sibling that is not aria-hidden,
// so the decorative dividers between sections are skipped.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <SmoothScroll>
          <main className="app-frame">
            {s.cover && <Cover />}
            {s.greeting && <Greeting />}
            {s.greeting && <BotanicalDivider variant="sprig" />}
            {s.family && <Family />}
            {s.family && <BotanicalDivider variant="dots" />}
            {s.calendar && <Calendar />}
            {s.calendar && <BotanicalDivider variant="leaf" />}
            {s.gallery && <Gallery />}
            {s.gallery && <BotanicalDivider variant="sprig" />}
            {s.location && <Location />}
            {s.location && <BotanicalDivider variant="dots" />}
            {s.account && <Account />}
            {s.account && <BotanicalDivider variant="leaf" />}
            {s.rsvp && <Rsvp />}
            {s.rsvp && <BotanicalDivider variant="dots" />}
            {s.guestbook && <Guestbook />}
            {s.guestbook && <BotanicalDivider variant="sprig" />}
            {s.share && <Share />}
            {s.footer && <Footer />}
          </main>
        </SmoothScroll>
      </ToastProvider>
    </MotionConfig>
  )
}
