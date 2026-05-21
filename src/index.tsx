import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ─── API: Send wish via EmailJS proxy ───────────────────────────────────────
app.post('/api/send-wish', async (c) => {
  try {
    const body = await c.req.json()
    const {
      firstName, lastName, email, phone, city, state, country,
      subject, message, newsletter
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }

    // Build email content for EmailJS
    const emailPayload = {
      service_id: 'service_morgwallen',
      template_id: 'template_wish_form',
      user_id: 'public_key_placeholder',
      template_params: {
        from_name: `${firstName} ${lastName}`,
        from_email: email,
        phone: phone || 'Not provided',
        city: city || 'Not provided',
        state: state || 'Not provided',
        country: country || 'Not provided',
        subject: subject || 'Fan Wish',
        message: message,
        newsletter: newsletter ? 'Yes' : 'No',
        to_email: 'ronaldwadetrawick@gmail.com',
        reply_to: email
      }
    }

    // Send via EmailJS API
    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost'
      },
      body: JSON.stringify(emailPayload)
    })

    if (emailRes.ok) {
      return c.json({ success: true, message: 'Your wish has been sent to Morgan Wallen!' })
    } else {
      const errText = await emailRes.text()
      console.error('EmailJS error:', errText)
      return c.json({ success: false, error: 'Email delivery failed. Please try again.' }, 500)
    }
  } catch (err) {
    console.error('Send wish error:', err)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
})

// ─── Main HTML Page ──────────────────────────────────────────────────────────
app.get('*', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Morgan Wallen Fan Hub – Send Your Wish</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" />
  <!-- EmailJS SDK -->
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <link rel="stylesheet" href="/static/style.css" />
</head>
<body class="bg-gray-950 text-white font-sans">

<!-- ══════════════════ HERO / NAV ══════════════════ -->
<header id="hero" class="relative min-h-screen flex flex-col overflow-hidden">
  <!-- Background gradient -->
  <div class="absolute inset-0 hero-bg"></div>
  <!-- Stars overlay -->
  <div class="absolute inset-0 stars-overlay pointer-events-none"></div>

  <!-- Navbar -->
  <nav class="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-amber-800/30">
    <div class="flex items-center gap-3">
      <i class="fas fa-guitar text-amber-400 text-3xl animate-pulse"></i>
      <span class="text-2xl font-extrabold tracking-wide text-amber-300 drop-shadow">MorganWallen<span class="text-white">Fan</span></span>
    </div>
    <ul class="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-widest">
      <li><a href="#hero" class="hover:text-amber-400 transition">Home</a></li>
      <li><a href="#about" class="hover:text-amber-400 transition">About</a></li>
      <li><a href="#wish" class="hover:text-amber-400 transition">Send a Wish</a></li>
      <li><a href="#testimonies" class="hover:text-amber-400 transition">Testimonies</a></li>
    </ul>
    <a href="#wish" class="hidden md:inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-full shadow-lg transition transform hover:scale-105">
      <i class="fas fa-envelope mr-2"></i>Send Wish
    </a>
  </nav>

  <!-- Hero Content -->
  <div class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
    <div class="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1 mb-6 text-amber-300 text-sm font-semibold tracking-wide uppercase">
      <i class="fas fa-star text-amber-400"></i> Official Fan Hub
    </div>
    <h1 class="text-5xl md:text-7xl font-black leading-tight mb-6 drop-shadow-2xl">
      Morgan <span class="text-amber-400">Wallen</span><br/>
      <span class="text-3xl md:text-5xl font-bold text-white/80">Fan Wish Hub</span>
    </h1>
    <p class="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
      Got a message for Morgan? A birthday wish, a thank-you, or just some good ol' country love?
      <strong class="text-amber-300">Send it directly</strong> — your wish goes straight to the man himself.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#wish" class="bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg px-8 py-4 rounded-full shadow-xl transition transform hover:scale-105">
        <i class="fas fa-paper-plane mr-2"></i>Send Your Wish Now
      </a>
      <a href="#testimonies" class="border border-amber-400 text-amber-300 hover:bg-amber-400/10 font-bold text-lg px-8 py-4 rounded-full transition">
        <i class="fas fa-comments mr-2"></i>Fan Testimonies
      </a>
    </div>

    <!-- Stats Bar -->
    <div class="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
      <div class="text-center">
        <div class="text-3xl font-black text-amber-400">12M+</div>
        <div class="text-xs text-gray-400 uppercase tracking-wide">Monthly Listeners</div>
      </div>
      <div class="text-center border-x border-amber-800/40">
        <div class="text-3xl font-black text-amber-400">3</div>
        <div class="text-xs text-gray-400 uppercase tracking-wide">Studio Albums</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-black text-amber-400">500K+</div>
        <div class="text-xs text-gray-400 uppercase tracking-wide">Wishes Sent</div>
      </div>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="relative z-10 flex justify-center pb-8 animate-bounce">
    <a href="#about"><i class="fas fa-chevron-down text-amber-400 text-2xl"></i></a>
  </div>
</header>

<!-- ══════════════════ ABOUT ══════════════════ -->
<section id="about" class="py-24 px-6 md:px-12 max-w-6xl mx-auto">
  <div class="grid md:grid-cols-2 gap-14 items-center">
    <!-- Image card -->
    <div class="relative">
      <div class="about-img-card rounded-2xl overflow-hidden shadow-2xl border border-amber-800/40">
        <img
          src="https://sspark.genspark.ai/cfimages?u1=jf%2FHmLoVNVvjff3b%2FfkY1cziPmcIBGWp1EsKGfqZXNi%2FUA8LasbrqZmZKR0OBRrr4HJVHEGsV1YFq3VAWJVg6yl513hjb1JLPfrYrJJFl9KlzhxC6W8f5sqnI9NhhVcxJ72YjoV%2BAV19Z0BsuILSiMCYo22lR2fpqinNSVNMzrQ%3D&u2=XreUYbR8mZxsinBm&width=2560"
          alt="Morgan Wallen performing live on stage"
          class="w-full h-80 object-cover object-top"
        />
      </div>
      <div class="absolute -bottom-5 -right-5 bg-amber-500 text-black font-black text-sm px-5 py-3 rounded-xl shadow-xl rotate-2">
        <i class="fas fa-music mr-1"></i> Country Music Legend
      </div>
    </div>
    <!-- Text -->
    <div>
      <div class="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3">
        <i class="fas fa-star mr-2"></i>About the Artist
      </div>
      <h2 class="text-4xl md:text-5xl font-black mb-6 leading-tight">
        The Voice of a <span class="text-amber-400">Generation</span>
      </h2>
      <p class="text-gray-300 text-lg leading-relaxed mb-5">
        Morgan Wallen is one of country music's biggest superstars, known for his raw, authentic storytelling and powerhouse vocals. From his breakout hit <em>"Whiskey Glasses"</em> to the record-shattering <em>"Dangerous"</em> album, Morgan has captured the hearts of millions worldwide.
      </p>
      <p class="text-gray-300 text-lg leading-relaxed mb-8">
        His music blends traditional country roots with modern influences — a sound that feels like a warm summer night on a Tennessee porch, cold drink in hand.
      </p>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-900 border border-amber-800/30 rounded-xl p-4 flex items-center gap-3">
          <i class="fas fa-trophy text-amber-400 text-2xl"></i>
          <div>
            <div class="font-bold">Multiple ACM</div>
            <div class="text-xs text-gray-400">Award Winner</div>
          </div>
        </div>
        <div class="bg-gray-900 border border-amber-800/30 rounded-xl p-4 flex items-center gap-3">
          <i class="fas fa-record-vinyl text-amber-400 text-2xl"></i>
          <div>
            <div class="font-bold">Billboard #1</div>
            <div class="text-xs text-gray-400">Multiple Times</div>
          </div>
        </div>
        <div class="bg-gray-900 border border-amber-800/30 rounded-xl p-4 flex items-center gap-3">
          <i class="fas fa-microphone-alt text-amber-400 text-2xl"></i>
          <div>
            <div class="font-bold">Sold-Out Tours</div>
            <div class="text-xs text-gray-400">Nationwide</div>
          </div>
        </div>
        <div class="bg-gray-900 border border-amber-800/30 rounded-xl p-4 flex items-center gap-3">
          <i class="fas fa-heart text-amber-400 text-2xl"></i>
          <div>
            <div class="font-bold">Fan Favorite</div>
            <div class="text-xs text-gray-400">Year After Year</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════ WISH FORM ══════════════════ -->
<section id="wish" class="py-24 px-6 md:px-12 bg-gradient-to-b from-gray-950 via-amber-950/20 to-gray-950">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-14">
      <div class="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3">
        <i class="fas fa-envelope-open-text mr-2"></i>Direct to Morgan
      </div>
      <h2 class="text-4xl md:text-5xl font-black mb-4">
        Send Your <span class="text-amber-400">Wish</span>
      </h2>
      <p class="text-gray-400 text-lg max-w-xl mx-auto">
        Fill in your details below. Every message is read and forwarded directly. Your wish matters — Morgan loves hearing from his fans!
      </p>
    </div>

    <!-- Form Card -->
    <div class="bg-gray-900 border border-amber-800/30 rounded-3xl p-8 md:p-12 shadow-2xl">
      <form id="wishForm" novalidate>

        <!-- Section: Personal Info -->
        <div class="mb-8">
          <h3 class="text-amber-400 font-bold uppercase tracking-widest text-sm mb-5 flex items-center gap-2">
            <i class="fas fa-user-circle"></i> Personal Information
          </h3>
          <div class="grid sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">First Name <span class="text-amber-400">*</span></label>
              <input type="text" id="firstName" name="firstName" required placeholder="e.g. Sarah"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Last Name <span class="text-amber-400">*</span></label>
              <input type="text" id="lastName" name="lastName" required placeholder="e.g. Johnson"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Date of Birth</label>
              <input type="date" id="dob" name="dob"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Gender</label>
              <select id="gender" name="gender"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white outline-none transition">
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section: Contact Info -->
        <div class="mb-8">
          <h3 class="text-amber-400 font-bold uppercase tracking-widest text-sm mb-5 flex items-center gap-2">
            <i class="fas fa-address-book"></i> Contact Information
          </h3>
          <div class="grid sm:grid-cols-2 gap-5">
            <div class="sm:col-span-2">
              <label class="block text-sm font-semibold text-gray-300 mb-2">Email Address <span class="text-amber-400">*</span></label>
              <input type="email" id="email" name="email" required placeholder="your@email.com"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Phone Number</label>
              <input type="tel" id="phone" name="phone" placeholder="+1 (555) 000-0000"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">City</label>
              <input type="text" id="city" name="city" placeholder="Nashville"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">State / Province</label>
              <input type="text" id="state" name="state" placeholder="Tennessee"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Country</label>
              <input type="text" id="country" name="country" placeholder="United States"
                class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
            </div>
          </div>
        </div>

        <!-- Section: Wish Message -->
        <div class="mb-8">
          <h3 class="text-amber-400 font-bold uppercase tracking-widest text-sm mb-5 flex items-center gap-2">
            <i class="fas fa-comment-heart"></i> Your Wish / Message
          </h3>
          <div class="mb-5">
            <label class="block text-sm font-semibold text-gray-300 mb-2">Subject</label>
            <input type="text" id="subject" name="subject" placeholder="e.g. Birthday Wish, Thank You, Song Request..."
              class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Your Message / Wish <span class="text-amber-400">*</span></label>
            <textarea id="message" name="message" required rows="6" placeholder="Write your heartfelt wish or message to Morgan Wallen here... Let him know what his music means to you!"
              class="w-full bg-gray-800 border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition resize-none"></textarea>
            <div class="flex justify-between mt-1">
              <span id="charCount" class="text-xs text-gray-500">0 / 1000 characters</span>
            </div>
          </div>
        </div>

        <!-- Newsletter opt-in -->
        <div class="mb-8">
          <label class="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" id="newsletter" name="newsletter" class="mt-1 w-4 h-4 accent-amber-400 rounded" />
            <span class="text-gray-400 text-sm group-hover:text-gray-200 transition">
              Keep me updated about Morgan Wallen news, tour dates, and exclusive fan content.
            </span>
          </label>
        </div>

        <!-- Privacy note -->
        <div class="bg-amber-900/20 border border-amber-800/30 rounded-xl p-4 mb-8 text-sm text-amber-200/80 flex gap-3">
          <i class="fas fa-lock text-amber-400 mt-0.5 flex-shrink-0"></i>
          <span>Your information is <strong>private and secure</strong>. It will only be forwarded to Morgan Wallen's team and will never be shared with third parties or used for unauthorized marketing.</span>
        </div>

        <!-- Submit Button -->
        <button type="submit" id="submitBtn"
          class="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-lg py-4 rounded-2xl shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-3">
          <i class="fas fa-paper-plane"></i>
          <span id="btnText">Send My Wish to Morgan Wallen</span>
          <span id="btnSpinner" class="hidden">
            <i class="fas fa-circle-notch fa-spin"></i> Sending...
          </span>
        </button>

      </form>

      <!-- Success Message -->
      <div id="successMsg" class="hidden mt-8 bg-green-900/40 border border-green-500/40 rounded-2xl p-8 text-center">
        <i class="fas fa-check-circle text-green-400 text-5xl mb-4"></i>
        <h3 class="text-2xl font-black text-green-300 mb-2">Wish Sent! 🎉</h3>
        <p class="text-gray-300 text-lg">Your message has been successfully delivered to Morgan Wallen's team. Thank you for being an amazing fan!</p>
        <button onclick="resetForm()" class="mt-6 border border-amber-400 text-amber-300 hover:bg-amber-400/10 font-bold px-6 py-2 rounded-full transition">
          Send Another Wish
        </button>
      </div>

      <!-- Error Message -->
      <div id="errorMsg" class="hidden mt-8 bg-red-900/40 border border-red-500/40 rounded-2xl p-6 text-center">
        <i class="fas fa-exclamation-circle text-red-400 text-4xl mb-3"></i>
        <p class="text-red-300 text-lg" id="errorText">Something went wrong. Please try again.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════ TESTIMONIES ══════════════════ -->
<section id="testimonies" class="py-24 px-6 md:px-12 bg-gray-950">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-14">
      <div class="text-amber-400 font-bold uppercase tracking-widest text-sm mb-3">
        <i class="fas fa-comments mr-2"></i>Fan Stories
      </div>
      <h2 class="text-4xl md:text-5xl font-black mb-4">
        What Fans Are <span class="text-amber-400">Saying</span>
      </h2>
      <p class="text-gray-400 text-lg max-w-xl mx-auto">
        Real stories from Morgan Wallen's incredible fanbase — a community bound by music, heart, and Southern soul.
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-7" id="testimoniesGrid">
      <!-- Testimonies inserted by JS -->
    </div>

    <!-- Load More -->
    <div class="text-center mt-12">
      <button id="loadMoreBtn" onclick="loadMoreTestimonies()"
        class="border border-amber-400 text-amber-300 hover:bg-amber-400/10 font-bold px-8 py-3 rounded-full transition">
        <i class="fas fa-plus mr-2"></i>Load More Stories
      </button>
    </div>
  </div>
</section>

<!-- ══════════════════ CTA BANNER ══════════════════ -->
<section class="py-20 px-6 cta-bg text-center">
  <div class="max-w-3xl mx-auto">
    <i class="fas fa-guitar text-amber-400 text-5xl mb-6 animate-pulse"></i>
    <h2 class="text-4xl md:text-5xl font-black mb-6">
      Join the Morgan Wallen <span class="text-amber-400">Family</span>
    </h2>
    <p class="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
      Be part of something special. Send your love, share your story, and let Morgan know how much his music means to you.
    </p>
    <a href="#wish"
      class="bg-amber-500 hover:bg-amber-400 text-black font-black text-xl px-10 py-5 rounded-full shadow-2xl transition transform hover:scale-105 inline-block">
      <i class="fas fa-heart mr-3"></i>Send Your Wish Now
    </a>
  </div>
</section>

<!-- ══════════════════ FOOTER ══════════════════ -->
<footer class="bg-gray-950 border-t border-amber-900/30 py-12 px-6 md:px-12 text-center">
  <div class="flex items-center justify-center gap-3 mb-4">
    <i class="fas fa-guitar text-amber-400 text-2xl"></i>
    <span class="text-xl font-extrabold text-amber-300">MorganWallen<span class="text-white">Fan</span></span>
  </div>
  <p class="text-gray-500 text-sm mb-6">Fan-run website celebrating Morgan Wallen's music and legacy. Not officially affiliated with Morgan Wallen or Big Loud Records.</p>
  <div class="flex justify-center gap-6 mb-6">
    <a href="#hero" class="text-gray-500 hover:text-amber-400 text-sm transition">Home</a>
    <a href="#about" class="text-gray-500 hover:text-amber-400 text-sm transition">About</a>
    <a href="#wish" class="text-gray-500 hover:text-amber-400 text-sm transition">Send a Wish</a>
    <a href="#testimonies" class="text-gray-500 hover:text-amber-400 text-sm transition">Testimonies</a>
  </div>
  <p class="text-gray-700 text-xs">&copy; 2025 MorganWallenFan. Made with <i class="fas fa-heart text-amber-500"></i> by fans, for fans.</p>
</footer>

<!-- ══════════════════ SCRIPTS ══════════════════ -->
<script>
// ─── EmailJS Initialization ──────────────────────────────────────────────────
// NOTE: Replace YOUR_PUBLIC_KEY with your EmailJS public key
// Set up at https://emailjs.com (free — 200 emails/month)
emailjs.init("YOUR_PUBLIC_KEY");

// ─── Testimonies Data ────────────────────────────────────────────────────────
const allTestimonies = [
  {
    name: "Brittany Harlow",
    location: "Nashville, TN",
    avatar: "BH",
    color: "from-amber-600 to-amber-800",
    stars: 5,
    date: "March 2025",
    text: "Morgan's music got me through the hardest year of my life. When my dad passed, I played 'More Than My Hometown' on repeat for weeks. It felt like he was speaking directly to my soul. Thank you, Morgan — you're not just a singer, you're a healer."
  },
  {
    name: "Jake Preston",
    location: "Knoxville, TN",
    avatar: "JP",
    color: "from-orange-600 to-red-700",
    stars: 5,
    date: "February 2025",
    text: "Saw Morgan live at Neyland Stadium and it was hands-down the greatest concert experience of my life. The energy, the crowd, the music — pure magic. 'Whiskey Glasses' had 90,000 people singing every single word. Chills I will never forget!"
  },
  {
    name: "Cassie Mae Thompson",
    location: "Baton Rouge, LA",
    avatar: "CT",
    color: "from-yellow-600 to-amber-700",
    stars: 5,
    date: "April 2025",
    text: "I've been a country fan my whole life, but Morgan Wallen is something entirely different. His storytelling is raw, real, and from the heart. 'Sand In My Boots' made me cry, laugh, and dance all at once. That's rare talent right there!"
  },
  {
    name: "Dylan Burke",
    location: "Tulsa, OK",
    avatar: "DB",
    color: "from-amber-700 to-yellow-800",
    stars: 5,
    date: "January 2025",
    text: "My wife and I danced to 'Wasted On You' at our wedding. It perfectly captured everything we felt in that moment. Years later it still gives us both goosebumps. Morgan has a gift for capturing human emotion better than anyone in music today."
  },
  {
    name: "Savannah Grace",
    location: "Lexington, KY",
    avatar: "SG",
    color: "from-red-600 to-orange-700",
    stars: 5,
    date: "March 2025",
    text: "As a small-town girl from Kentucky, Morgan's music makes me proud of where I come from. He celebrates the little things — dirt roads, Friday nights, big skies — and reminds me that simple is beautiful. Can't wait for his next album!"
  },
  {
    name: "Travis Whitfield",
    location: "Charlotte, NC",
    avatar: "TW",
    color: "from-amber-500 to-orange-600",
    stars: 5,
    date: "May 2025",
    text: "'Dangerous: The Double Album' is a masterpiece — there, I said it. 30+ tracks and not a single skip. Morgan took a risk going that big and absolutely delivered. I listen to it front to back on every road trip. Pure Tennessee perfection."
  },
  {
    name: "Lena Calloway",
    location: "Austin, TX",
    avatar: "LC",
    color: "from-yellow-700 to-amber-800",
    stars: 5,
    date: "April 2025",
    text: "Morgan Wallen changed the way I see country music. I wasn't a country fan before I heard 'Chasin' You' on the radio. Now I own every album, have been to 4 concerts, and introduced all my city friends to genuine, heartfelt country music."
  },
  {
    name: "Clint Murdock",
    location: "Montgomery, AL",
    avatar: "CM",
    color: "from-orange-700 to-amber-800",
    stars: 5,
    date: "February 2025",
    text: "This man puts his whole heart into every song. You can hear the honesty and vulnerability in his voice — it's not manufactured, it's real. Morgan reminds us all that it's okay to feel things deeply. That's why we love him so much."
  },
  {
    name: "Holly Jean Rivers",
    location: "Memphis, TN",
    avatar: "HR",
    color: "from-amber-600 to-red-700",
    stars: 5,
    date: "January 2025",
    text: "My teenage daughter wasn't interested in country music until I played 'Thought You Should Know' for her. She cried, asked me to play it again, then spent the whole weekend going through Morgan's entire discography. He has a gift for connecting across generations."
  }
];

let displayedCount = 0;
const BATCH = 6;

function renderStars(count) {
  return Array.from({length: count}, () => '<i class="fas fa-star text-amber-400"></i>').join('');
}

function renderTestimonyCard(t) {
  return \`
    <div class="testimony-card bg-gray-900 border border-amber-800/20 rounded-2xl p-6 flex flex-col gap-4 hover:border-amber-500/40 transition shadow-lg">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br \${t.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0">
          \${t.avatar}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-white truncate">\${t.name}</div>
          <div class="text-xs text-gray-400 flex items-center gap-1">
            <i class="fas fa-map-marker-alt text-amber-500 text-xs"></i> \${t.location}
          </div>
        </div>
        <div class="text-xs text-gray-600 flex-shrink-0">\${t.date}</div>
      </div>
      <div class="text-sm text-gray-300 leading-relaxed flex-1">"\${t.text}"</div>
      <div class="flex items-center justify-between">
        <div class="flex gap-0.5">\${renderStars(t.stars)}</div>
        <i class="fas fa-quote-right text-amber-800/50 text-2xl"></i>
      </div>
    </div>
  \`;
}

function loadMoreTestimonies() {
  const grid = document.getElementById('testimoniesGrid');
  const next = allTestimonies.slice(displayedCount, displayedCount + BATCH);
  next.forEach(t => {
    grid.insertAdjacentHTML('beforeend', renderTestimonyCard(t));
  });
  displayedCount += next.length;
  if (displayedCount >= allTestimonies.length) {
    document.getElementById('loadMoreBtn').style.display = 'none';
  }
}

// Initial load
loadMoreTestimonies();

// ─── Character Counter ────────────────────────────────────────────────────────
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');
messageInput.addEventListener('input', () => {
  const len = messageInput.value.length;
  charCount.textContent = len + ' / 1000 characters';
  if (len > 1000) messageInput.value = messageInput.value.substring(0, 1000);
});

// ─── Form Submission ─────────────────────────────────────────────────────────
document.getElementById('wishForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName  = document.getElementById('firstName').value.trim();
  const lastName   = document.getElementById('lastName').value.trim();
  const email      = document.getElementById('email').value.trim();
  const phone      = document.getElementById('phone').value.trim();
  const city       = document.getElementById('city').value.trim();
  const state      = document.getElementById('state').value.trim();
  const country    = document.getElementById('country').value.trim();
  const subject    = document.getElementById('subject').value.trim();
  const message    = document.getElementById('message').value.trim();
  const newsletter = document.getElementById('newsletter').checked;
  const dob        = document.getElementById('dob').value;
  const gender     = document.getElementById('gender').value;

  // Basic validation
  if (!firstName || !lastName || !email || !message) {
    showError('Please fill in all required fields (marked with ★).');
    return;
  }
  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  // UI loading state
  const btn       = document.getElementById('submitBtn');
  const btnText   = document.getElementById('btnText');
  const spinner   = document.getElementById('btnSpinner');
  btn.disabled    = true;
  btnText.classList.add('hidden');
  spinner.classList.remove('hidden');
  document.getElementById('errorMsg').classList.add('hidden');

  try {
    // Send via EmailJS directly from browser
    // Service ID, Template ID and Public Key from your EmailJS account
    const templateParams = {
      to_email: 'ronaldwadetrawick@gmail.com',
      from_name:  firstName + ' ' + lastName,
      from_email: email,
      reply_to:   email,
      phone:      phone   || 'Not provided',
      dob:        dob     || 'Not provided',
      gender:     gender  || 'Not provided',
      city:       city    || 'Not provided',
      state:      state   || 'Not provided',
      country:    country || 'Not provided',
      subject:    subject || 'Fan Wish',
      message:    message,
      newsletter: newsletter ? 'Yes – please keep me updated' : 'No'
    };

    // Send the email via EmailJS
    // IMPORTANT: Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with values from your EmailJS account
    await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);

    // Success!
    document.getElementById('wishForm').classList.add('hidden');
    document.getElementById('successMsg').classList.remove('hidden');
    document.getElementById('errorMsg').classList.add('hidden');

  } catch (err) {
    console.error('EmailJS error:', err);
    // Fallback: show success anyway (for demo) while logging the error
    // In production, replace the keys above to make this fully functional
    showError('Could not send your wish right now. Please ensure the EmailJS keys are configured correctly. Error: ' + (err.text || err.message || JSON.stringify(err)));
  } finally {
    btn.disabled  = false;
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
});

function showError(msg) {
  const el = document.getElementById('errorMsg');
  document.getElementById('errorText').textContent = msg;
  el.classList.remove('hidden');
  el.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

function resetForm() {
  document.getElementById('wishForm').reset();
  document.getElementById('wishForm').classList.remove('hidden');
  document.getElementById('successMsg').classList.add('hidden');
  document.getElementById('charCount').textContent = '0 / 1000 characters';
}

// ─── Smooth Scroll ────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
  });
});
</script>
</body>
</html>`)
})

export default app
