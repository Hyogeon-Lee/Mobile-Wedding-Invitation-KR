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

const s = wedding.sections

// Page order. Sections must stay direct children of <main>: the cover's scroll cue targets its next sibling.
export default function App() {
  return (
    <ToastProvider>
      <SmoothScroll>
        <main className="app-frame">
          {s.cover && <Cover />}
          {s.greeting && <Greeting />}
          {s.family && <Family />}
          {s.calendar && <Calendar />}
          {s.gallery && <Gallery />}
          {s.location && <Location />}
          {s.account && <Account />}
          {s.rsvp && <Rsvp />}
          {s.guestbook && <Guestbook />}
          {s.share && <Share />}
          {s.footer && <Footer />}
        </main>
      </SmoothScroll>
    </ToastProvider>
  )
}
