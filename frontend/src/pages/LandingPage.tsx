import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

// ─── Animation helpers ────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: 'easeOut', delay },
});

// ─── Service card data ────────────────────────────────────────────
const SERVICE_CARDS = [
  {
    key: 'medical',
    title: 'Medical Care',
    desc: 'Focuses on relieving symptoms and managing pain.',
    items: ['Symptom management', 'Pain control', 'Medication management', 'Coordination with other treatments'],
    bg: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    key: 'advanced',
    title: 'Advanced Care Planning',
    desc: 'Helping patients make informed decisions about their future care.',
    items: ['Discussing goals of care', 'Advance directives', 'Decision-making support', 'Respecting patient wishes'],
    bg: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2070&auto=format&fit=crop',
  },
  {
    key: 'spiritual',
    title: 'Spiritual Care',
    desc: "Supporting the patient's spiritual beliefs and values.",
    items: ['Respect for beliefs and values', 'Spiritual counseling', 'Support for meaning and hope', 'End-of-life rituals (as desired)'],
    bg: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2070&auto=format&fit=crop',
  },
  {
    key: 'hospice',
    title: 'Hospice Care',
    desc: 'When curative treatment is no longer the goal.',
    items: ['Comfort-focused care', '24/7 support', 'Home, inpatient, or facility care'],
    bg: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2070&auto=format&fit=crop',
  },
  {
    key: 'coordination',
    title: 'Care Coordination',
    desc: 'Ensuring seamless communication and continuity of care.',
    items: ['Multidisciplinary team', 'Communication with all providers', 'Individualized care plan', 'Continuity of care'],
    bg: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop',
  },
];

// Duplicate for seamless infinite scroll (original + clone)
const MARQUEE_CARDS = [...SERVICE_CARDS, ...SERVICE_CARDS];

// ─── Outcome items ────────────────────────────────────────────────
const OUTCOMES = [
  { title: 'Less Pain',         desc: 'Symptoms controlled so daily life stays possible.' },
  { title: 'Greater Comfort',   desc: 'Care that puts physical ease first, every day.' },
  { title: 'Emotional Peace',   desc: 'Counseling and support for anxiety, fear, and grief.' },
  { title: 'Dignity',           desc: 'Beliefs, values, and personal wishes respected.' },
  { title: 'Family Support',    desc: 'Education, respite, and bereavement care for caregivers.' },
];

// ─── Stats ────────────────────────────────────────────────────────
const STATS = [
  { value: '15,000+', label: 'Total Patients Cared For' },
  { value: '250+',    label: 'Total Nurses' },
  { value: '120+',    label: 'Total Physicians' },
];

// ═══════════════════════════════════════════════════════════════════
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const aboutRef    = useRef<HTMLElement>(null);
  const purposeRef  = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const outcomesRef = useRef<HTMLElement>(null);
  const statsRef    = useRef<HTMLElement>(null);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Navbar receives scroll helpers via data-* so it can smooth-scroll to sections */}
      <Navbar
        landingSections={{
          about:    aboutRef,
          purpose:  purposeRef,
          services: servicesRef,
          outcomes: outcomesRef,
          stats:    statsRef,
        }}
      />

      {/* ══════════════════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section
        className="landing-hero relative min-h-screen flex items-center justify-start overflow-hidden"
        style={{ paddingTop: 80 }}
        aria-label="Hero"
      >
        {/* Background image — swaps on dark mode via CSS */}
        <div
          className="landing-hero-bg absolute inset-0 bg-cover bg-center"
          aria-hidden
        />

        {/* Left-side gradient overlay for text legibility */}
        <div
          className="landing-hero-overlay absolute inset-y-0 left-0 w-full lg:w-3/5"
          aria-hidden
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-xl"
          >
            {/* Eyebrow */}
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.15em] mb-4"
              style={{ color: '#93c5fd' }}
            >
              Yekatit 12 Hospital Medical College
            </span>

            {/* Headline — Playfair Display */}
            <h1
              className="font-display font-bold leading-[1.12] mb-6"
              style={{
                fontSize: 'clamp(2.6rem, 5.5vw, 3.8rem)',
                color: '#ffffff',
                textShadow: '0 2px 12px rgba(0,0,0,0.35)',
              }}
            >
              Palliative Care
            </h1>

            <p
              className="text-lg leading-[1.75] mb-10"
              style={{
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
                maxWidth: '30rem',
              }}
            >
              Whole-person care. Support for patients and families. Better quality of life.
              We provide compassionate care at every stage of illness, focusing on comfort,
              dignity, and peace.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 rounded-[10px] px-7 py-3.5 text-sm font-semibold transition-colors"
                style={{ background: '#ffffff', color: '#0f172a' }}
              >
                Sign In
                <ArrowRight size={15} />
              </motion.button>

              <motion.button
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 rounded-[10px] px-7 py-3.5 text-sm font-semibold transition-colors"
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255,255,255,0.55)',
                }}
              >
                Register as Staff
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. ABOUT SECTION
      ══════════════════════════════════════════════════════════ */}
      <section
        id="about"
        ref={aboutRef}
        className="py-24 px-6"
        style={{ background: 'var(--color-surface-lowest)' }}
        aria-labelledby="about-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14 xl:gap-20">

            {/* Image */}
            <motion.div {...fadeIn(0)} className="w-full lg:w-1/2 flex-shrink-0">
              <div
                className="w-full overflow-hidden"
                style={{ borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}
              >
                <img
                  src="/images/about-team.jpg"
                  alt="Palliative care team at Yekatit 12 Medical College"
                  className="w-full h-auto object-cover block"
                  style={{ maxHeight: 420 }}
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div {...fadeUp(0.1)} className="w-full lg:w-1/2">
              <p
                className="text-xs font-bold uppercase tracking-[0.12em] mb-3"
                style={{ color: 'var(--color-primary)' }}
              >
                About
              </p>
              <h2
                id="about-heading"
                className="font-display font-bold leading-tight mb-6"
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                  color: 'var(--color-on-surface)',
                }}
              >
                About Palliative Care
              </h2>
              <p
                className="text-base leading-[1.85] mb-5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Palliative care is specialized medical care for people living with a serious illness.
                It is focused on providing relief from the symptoms and stress of the illness.
                The goal is to improve quality of life for both the patient and the family.
              </p>
              <p
                className="text-base leading-[1.85]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                At Yekatit 12 Medical College, our multidisciplinary team works together to address
                physical, emotional, social, and spiritual needs — coordinating an individualized
                care plan around what matters most to each patient.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. MISSION, VISION & VALUES
      ══════════════════════════════════════════════════════════ */}
      <section
        id="purpose"
        ref={purposeRef}
        className="py-24 px-6"
        style={{
          background: 'var(--color-background)',
          borderTop: '1px solid var(--color-border)',
        }}
        aria-labelledby="purpose-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-[0.12em] mb-3"
              style={{ color: 'var(--color-primary)' }}
            >
              Our Purpose
            </p>
            <h2
              id="purpose-heading"
              className="font-display font-bold"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                color: 'var(--color-on-surface)',
              }}
            >
              Our Mission, Vision &amp; Values
            </h2>
            <p
              className="mt-3 text-sm max-w-xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Compassionate care for patients and families at every stage of illness —
              whole-person care, support for patients and families, better quality of life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mission */}
            <motion.div
              {...fadeUp(0.05)}
              whileHover={{ y: -5, transition: { duration: 0.18 } }}
              className="rounded-2xl p-8"
              style={{
                background: 'var(--color-surface-lowest)',
                borderTop: `4px solid var(--color-primary)`,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3
                className="font-display font-semibold text-xl mb-4"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Our Mission
              </h3>
              <p className="text-sm leading-[1.85]" style={{ color: 'var(--color-text-secondary)' }}>
                To deliver whole-person palliative care that relieves pain and symptoms while
                supporting the emotional, social, and spiritual needs of every patient and family
                we serve.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              {...fadeUp(0.1)}
              whileHover={{ y: -5, transition: { duration: 0.18 } }}
              className="rounded-2xl p-8"
              style={{
                background: 'var(--color-surface-lowest)',
                borderTop: `4px solid var(--color-primary)`,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3
                className="font-display font-semibold text-xl mb-4"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Our Vision
              </h3>
              <p className="text-sm leading-[1.85]" style={{ color: 'var(--color-text-secondary)' }}>
                A future where no patient faces serious illness in pain or alone — where comfort,
                dignity, and quality of life are part of care from the very first day of diagnosis,
                not only at the end.
              </p>
            </motion.div>

            {/* Values */}
            <motion.div
              {...fadeUp(0.15)}
              whileHover={{ y: -5, transition: { duration: 0.18 } }}
              className="rounded-2xl p-8"
              style={{
                background: 'var(--color-surface-lowest)',
                borderTop: `4px solid var(--color-primary)`,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3
                className="font-display font-semibold text-xl mb-4"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Our Values
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Compassion in every interaction',
                  'Dignity and respect for beliefs and values',
                  'Honest, open communication',
                  'Respecting patient wishes and choices',
                  'Teamwork across every discipline',
                  'Support for families and caregivers',
                ].map((val) => (
                  <li key={val} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span
                      className="mt-0.5 flex-shrink-0 font-bold"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden
                    >
                      •
                    </span>
                    {val}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. CARE SERVICE MODEL (Infinite Marquee)
      ══════════════════════════════════════════════════════════ */}
      <section
        id="services"
        ref={servicesRef}
        className="py-24 overflow-hidden"
        style={{
          background: 'var(--color-background)',
          borderTop: '1px solid var(--color-border)',
        }}
        aria-labelledby="services-heading"
      >
        <motion.div {...fadeUp()} className="text-center mb-12 px-6">
          <p
            className="text-xs font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            Care Service
          </p>
          <h2
            id="services-heading"
            className="font-display font-bold"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              color: 'var(--color-on-surface)',
            }}
          >
            Palliative Care Service Model
          </h2>
          <p
            className="mt-3 text-sm max-w-xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Compassionate care for patients and families at every stage of illness.
          </p>
        </motion.div>

        {/* Marquee wrapper — overflow hidden on the section prevents horizontal scroll */}
        <div className="overflow-hidden py-4" aria-label="Care service cards carousel">
          <div className="marquee-track" role="list">
            {MARQUEE_CARDS.map((card, i) => (
              <article
                key={`${card.key}-${i}`}
                role="listitem"
                className="flex-shrink-0 mx-2.5 rounded-2xl overflow-hidden"
                style={{
                  width: 240,
                  height: 340,
                  backgroundImage: `url('${card.bg}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                }}
              >
                {/* Gradient overlay + text */}
                <div
                  className="flex flex-col justify-end h-full p-4"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.42) 55%, transparent 100%)',
                  }}
                >
                  <h3
                    className="font-display font-semibold text-sm leading-tight mb-1"
                    style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[11px] leading-snug mb-2"
                    style={{ color: 'rgba(255,255,255,0.88)' }}
                  >
                    {card.desc}
                  </p>
                  <ul className="space-y-0.5">
                    {card.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-[10px] leading-tight"
                        style={{ color: 'rgba(255,255,255,0.82)' }}
                      >
                        <span aria-hidden className="font-bold text-white text-xs leading-none mt-px">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. OUTCOMES — "The Result"
      ══════════════════════════════════════════════════════════ */}
      <section
        id="outcomes"
        ref={outcomesRef}
        className="py-24 px-6"
        style={{
          background: 'var(--color-surface-lowest)',
          borderTop: '1px solid var(--color-border)',
        }}
        aria-labelledby="outcomes-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <p
              className="text-xs font-bold uppercase tracking-[0.12em] mb-3"
              style={{ color: 'var(--color-primary)' }}
            >
              The Result
            </p>
            <h2
              id="outcomes-heading"
              className="font-display font-bold"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                color: 'var(--color-on-surface)',
              }}
            >
              Better Quality of Life
            </h2>
            <p
              className="mt-3 text-sm max-w-lg mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              What whole-person palliative care makes possible for patients and their families.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {OUTCOMES.map((outcome, i) => (
              <motion.div
                key={outcome.title}
                {...fadeUp(i * 0.07)}
                whileHover={{ y: -5, transition: { duration: 0.18 } }}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <p
                  className="font-display font-semibold text-base mb-2 leading-tight"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {outcome.title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {outcome.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. CLOSING BANNER
      ══════════════════════════════════════════════════════════ */}
      <section
        className="px-6 py-16"
        style={{ background: 'var(--color-background)', borderTop: '1px solid var(--color-border)' }}
        aria-label="Closing statement"
      >
        <motion.div
          {...fadeUp()}
          className="max-w-6xl mx-auto rounded-2xl py-14 px-8 text-center"
          style={{ background: 'var(--color-primary)' }}
        >
          <p
            className="font-display font-semibold italic leading-[1.6] max-w-3xl mx-auto"
            style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              color: '#ffffff',
            }}
          >
            Palliative care is not just about the end of life — it&rsquo;s about living well,
            every day, for as long as possible.
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. STATISTICS
      ══════════════════════════════════════════════════════════ */}
      <section
        id="stats"
        ref={statsRef}
        className="py-24 px-6"
        style={{
          background: 'var(--color-surface-lowest)',
          borderTop: '1px solid var(--color-border)',
        }}
        aria-labelledby="stats-heading"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <p
              className="text-xs font-bold uppercase tracking-[0.12em] mb-3"
              style={{ color: 'var(--color-primary)' }}
            >
              Our Impact
            </p>
            <h2
              id="stats-heading"
              className="font-display font-bold"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                color: 'var(--color-on-surface)',
              }}
            >
              Statistics
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp(i * 0.1)}
                whileHover={{ y: -5, transition: { duration: 0.18 } }}
                className="rounded-2xl p-10 text-center"
                style={{
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <p
                  className="font-display font-bold leading-none mb-3"
                  style={{
                    fontSize: 'clamp(2.4rem, 4vw, 3rem)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-on-surface)' }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
