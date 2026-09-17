import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Shield, Home, Activity, Users, ClipboardList, ArrowRight, GitBranch,
  Target, Eye, CheckCircle, Sparkles, Handshake, Scale, Lock, HeartHandshake,
  Globe, UserCheck, Star, Stethoscope, Brain, HandHeart,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

// ─── animation presets ────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 22 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true        },
  transition: { duration: 0.55, ease: 'easeOut', delay },
});

const fadeLeft = {
  initial:   { opacity: 0, x: -28 },
  animate:   { opacity: 1, x: 0   },
  transition:{ duration: 0.6, ease: 'easeOut' },
};

const fadeRight = {
  initial:   { opacity: 0, x: 28  },
  animate:   { opacity: 1, x: 0   },
  transition:{ duration: 0.6, ease: 'easeOut', delay: 0.15 },
};

// ─── decorative blob ──────────────────────────────────────────────
const Blob: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <div
    aria-hidden
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    style={style}
  />
);

// ─── section pill label ───────────────────────────────────────────
const Pill: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <span
    className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] mb-5"
    style={{
      background: color ?? 'var(--color-primary-light)',
      color: color ? '#fff' : 'var(--color-primary)',
    }}
  >
    {children}
  </span>
);

// ─── info strip card ──────────────────────────────────────────────
const QuickCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; accent: string }> = ({
  icon, title, desc, accent,
}) => (
  <motion.div
    {...fadeUp(0)}
    whileHover={{ y: -4, transition: { duration: 0.18 } }}
    className="flex flex-col items-center text-center gap-3 rounded-2xl p-6"
    style={{
      background: 'var(--color-surface-lowest)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-card)',
    }}
  >
    <div
      className="flex h-12 w-12 items-center justify-center rounded-2xl"
      style={{ background: accent + '22', color: accent }}
    >
      {icon}
    </div>
    <p className="text-sm font-bold text-on-surface">{title}</p>
    <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
  </motion.div>
);

// ─── goal item ────────────────────────────────────────────────────
const GoalItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-3">
    <span
      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
      style={{ background: '#43B98222', color: '#43B982' }}
    >
      <CheckCircle size={12} />
    </span>
    <span className="text-sm text-text-secondary leading-relaxed">{children}</span>
  </li>
);

// ─── value chip ───────────────────────────────────────────────────
const ValueChip: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <motion.div
    whileHover={{ scale: 1.04, transition: { duration: 0.15 } }}
    className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-medium cursor-default select-none"
    style={{
      background: 'var(--color-surface-lowest)',
      border: '1.5px solid var(--color-border)',
      color: 'var(--color-on-surface)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}
  >
    <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
    {label}
  </motion.div>
);

// ─── stat counter ─────────────────────────────────────────────────
const StatBadge: React.FC<{ value: string; label: string; accent: string }> = ({ value, label, accent }) => (
  <div className="flex flex-col items-center gap-1 px-2">
    <span className="text-3xl font-extrabold leading-none" style={{ color: accent }}>{value}</span>
    <span className="text-xs text-text-muted text-center leading-tight">{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--color-background)' }}>
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background decorative blobs */}
        <Blob
          className="w-[600px] h-[600px] -top-40 -left-60 opacity-[0.07]"
          style={{ background: '#4A90C4' }}
        />
        <Blob
          className="w-[500px] h-[500px] top-10 -right-52 opacity-[0.06]"
          style={{ background: '#43B982' }}
        />
        <Blob
          className="w-[300px] h-[300px] bottom-0 left-1/2 opacity-[0.05]"
          style={{ background: '#7B5EA7' }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-14 xl:gap-20 items-center">

            {/* ── Left ── */}
            <motion.div {...fadeLeft}>
              {/* Eyebrow */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold mb-7"
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Yekatit 12 Hospital · Palliative Care Unit
              </div>

              {/* Headline */}
              <h1
                className="font-extrabold leading-[1.08] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', color: 'var(--color-on-surface)' }}
              >
                Compassionate Care,{' '}
                <span
                  className="relative inline-block"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Coordinated
                  {/* underline accent */}
                  <svg
                    aria-hidden
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 200 8"
                    preserveAspectRatio="none"
                    style={{ height: 6, opacity: 0.35 }}
                  >
                    <path d="M0 6 Q50 1 100 5 Q150 9 200 4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{' '}
                Support
              </h1>

              <p
                className="text-lg leading-[1.75] mb-9"
                style={{ color: 'var(--color-text-secondary)', maxWidth: '32rem' }}
              >
                A comprehensive clinical platform for palliative care teams to monitor patients,
                coordinate home visits, manage medications, and ensure holistic end-of-life care.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={() => navigate('/login')}
                    rightIcon={<ArrowRight size={17} />}
                    className="px-8 shadow-lg shadow-primary/25"
                  >
                    Sign In
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/register')}
                    className="px-8"
                  >
                    Register as Staff
                  </Button>
                </motion.div>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-5">
                {[
                  { icon: <Shield size={13} />, text: 'Built with clinical teams' },
                  { icon: <Home size={13} />,   text: 'Home-visit ready'          },
                  { icon: <Lock size={13} />,   text: 'Privacy-first records'     },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
                    {text}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div
                className="flex flex-wrap gap-8 mt-10 pt-8"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <StatBadge value="8+"   label="Care domains"         accent="var(--color-primary)" />
                <StatBadge value="100%" label="Patient-centered"      accent="#43B982" />
                <StatBadge value="24/7" label="Coordinated support"   accent="#4A90C4" />
              </div>
            </motion.div>

            {/* ── Right — infographic ── */}
            <motion.div {...fadeRight} className="hidden lg:block">
              {/* Subtle glow behind the card */}
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-20 pointer-events-none"
                style={{ background: 'linear-gradient(135deg,#4A90C4,#43B982)' }}
              />
              <div
                className="relative rounded-3xl p-3"
                style={{
                  background: 'var(--color-surface-lowest)',
                  border: '1.5px solid var(--color-border)',
                  boxShadow: '0 24px 60px rgba(43,108,176,0.14), 0 4px 16px rgba(0,0,0,0.06)',
                }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-3 py-2.5 mb-2 rounded-2xl"
                  style={{ background: 'var(--color-surface-low)' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ background: 'var(--color-primary)', boxShadow: '0 2px 6px rgba(43,108,176,0.4)' }}
                    >
                      <Heart size={14} className="text-white" />
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--color-on-surface)' }}>
                      Palliative Care Service Model
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success status-pulse flex" />
                    ACTIVE
                  </span>
                </div>

                {/* The infographic */}
                <img
                  src="/palliative-care-model.png"
                  alt="Palliative Care Service Model — eight care domains surrounding a central care scene: Medical Care, Emotional and Psychological Support, Social Support, Spiritual Care, Hospice Care, Family and Caregiver Support, Care Coordination, Rehabilitation and Complementary Therapies, and Advanced Care Planning."
                  className="w-full h-auto rounded-2xl block"
                  loading="eager"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          QUICK-STAT STRIP
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-12 px-6"
        style={{ background: 'var(--color-surface-lowest)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: <Heart size={20} />,        title: 'Compassionate Care',   desc: 'Patient-centered support for families through every stage of serious illness.',           accent: '#E74F3D' },
            { icon: <ClipboardList size={20} />, title: 'Care Coordination',    desc: 'Visits, medications, referrals, and follow-up care managed in one place.',               accent: '#4A90C4' },
            { icon: <Activity size={20} />,      title: 'Patient Monitoring',   desc: 'Track KPS/PPS progress, symptoms, and clinical observations over time.',                  accent: '#43B982' },
            { icon: <Users size={20} />,         title: 'Team Collaboration',   desc: 'Role-specific workflows for physicians, nurses, pharmacists, and care teams.',           accent: '#7B5EA7' },
          ].map((c) => (
            <QuickCard key={c.title} {...c} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOSPICE AND PALLIATIVE CARE
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden">
        <Blob className="w-96 h-96 -right-32 top-0 opacity-[0.06]" style={{ background: '#4A90C4' }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-14 items-center">

            {/* Left — label + heading */}
            <motion.div {...fadeUp(0)}>
              <Pill>About</Pill>
              <h2
                className="font-bold leading-tight mb-6"
                style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', color: 'var(--color-on-surface)' }}
              >
                Hospice and{' '}
                <span style={{ color: 'var(--color-primary)' }}>Palliative Care</span>
              </h2>

              {/* Three highlight cards */}
              <div className="space-y-3">
                {[
                  { icon: <Activity size={16} />,    label: 'Symptom relief',              accent: '#43B982' },
                  { icon: <Brain size={16} />,        label: 'Emotional & spiritual support', accent: '#7B5EA7' },
                  { icon: <HandHeart size={16} />,    label: 'Family-centered care',         accent: '#4A90C4' },
                ].map(({ icon, label, accent }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: accent + '14', border: `1px solid ${accent}30` }}
                  >
                    <span className="flex-shrink-0" style={{ color: accent }}>{icon}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-on-surface)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — body text */}
            <motion.div {...fadeUp(0.1)}>
              <div
                className="rounded-3xl p-8 md:p-10"
                style={{
                  background: 'var(--color-surface-lowest)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {/* Quote mark */}
                <div
                  className="text-5xl font-black leading-none mb-4 select-none"
                  style={{ color: 'var(--color-primary)', opacity: 0.15 }}
                  aria-hidden
                >
                  "
                </div>
                <p
                  className="text-base leading-[1.9]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <strong style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
                    Hospice and palliative care
                  </strong>{' '}
                  is a specialized approach to healthcare that aims to improve the{' '}
                  <strong style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
                    quality of life of patients with serious, life-limiting, or terminal illnesses and their families
                  </strong>
                  . It focuses on relieving pain and other physical symptoms while also addressing
                  psychological, social, emotional, and spiritual needs. Palliative care can be provided
                  alongside disease-directed treatment, whereas hospice care generally focuses on comfort
                  and quality of life when curative treatment is no longer the main goal.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MISSION & VISION
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-24 px-6"
        style={{ background: 'var(--color-surface-lowest)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <Pill>Our Purpose</Pill>
            <h2
              className="font-bold"
              style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', color: 'var(--color-on-surface)' }}
            >
              Mission &amp; Vision
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-7">
            {/* Mission */}
            <motion.div {...fadeUp(0.05)}>
              <div
                className="relative h-full rounded-3xl p-8 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-surface-lowest) 60%)',
                  border: '1.5px solid var(--color-primary)',
                  boxShadow: '0 8px 32px rgba(43,108,176,0.10)',
                }}
              >
                {/* Large background icon */}
                <div className="absolute right-5 top-5 opacity-[0.07] pointer-events-none">
                  <Target size={100} style={{ color: 'var(--color-primary)' }} />
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md flex-shrink-0"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    <Target size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
                      Our Mission
                    </p>
                    <h3 className="text-xl font-bold text-on-surface">What we do</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  To provide{' '}
                  <strong style={{ color: 'var(--color-on-surface)' }}>
                    compassionate, holistic, and patient-centered care
                  </strong>{' '}
                  that relieves suffering, manages symptoms, supports patients and families, and promotes
                  dignity and comfort throughout serious illness and at the end of life.
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div {...fadeUp(0.12)}>
              <div
                className="relative h-full rounded-3xl p-8 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #43B98218 0%, var(--color-surface-lowest) 60%)',
                  border: '1.5px solid #43B98240',
                  boxShadow: '0 8px 32px rgba(67,185,130,0.10)',
                }}
              >
                <div className="absolute right-5 top-5 opacity-[0.07] pointer-events-none">
                  <Eye size={100} style={{ color: '#43B982' }} />
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md flex-shrink-0"
                    style={{ background: '#43B982' }}
                  >
                    <Eye size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#43B982' }}>
                      Our Vision
                    </p>
                    <h3 className="text-xl font-bold text-on-surface">Where we're headed</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  To create a healthcare system where{' '}
                  <strong style={{ color: 'var(--color-on-surface)' }}>
                    every person with a serious or life-limiting illness
                  </strong>{' '}
                  has access to high-quality, compassionate care and can live as comfortably, meaningfully,
                  and independently as possible until the end of life.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          GOALS
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden">
        <Blob className="w-80 h-80 -left-32 bottom-0 opacity-[0.05]" style={{ background: '#F5A34A' }} />

        <div className="relative max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <Pill color="#D4A017">What We Do</Pill>
            <h2
              className="font-bold mb-4"
              style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', color: 'var(--color-on-surface)' }}
            >
              Our Goals
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Guiding principles that shape how we care for patients and families every day.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.08)}>
            <div
              className="max-w-4xl mx-auto rounded-3xl p-8 md:p-10"
              style={{
                background: 'var(--color-surface-lowest)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="grid sm:grid-cols-2 gap-x-14 gap-y-3.5">
                <ul className="space-y-3.5">
                  <GoalItem>Relieve pain and other distressing symptoms</GoalItem>
                  <GoalItem>Improve the quality of life of patients and their families</GoalItem>
                  <GoalItem>Provide holistic care addressing physical, psychological, social, and spiritual needs</GoalItem>
                  <GoalItem>Respect patient autonomy, dignity, values, and preferences</GoalItem>
                  <GoalItem>Support families and caregivers during illness, death, and bereavement</GoalItem>
                </ul>
                <ul className="space-y-3.5">
                  <GoalItem>Help patients make informed decisions about their care and treatment</GoalItem>
                  <GoalItem>Provide appropriate end-of-life care that promotes comfort and dignity</GoalItem>
                  <GoalItem>Coordinate care among healthcare professionals, patients, families, and caregivers</GoalItem>
                  <GoalItem>Avoid unnecessary suffering and inappropriate interventions when they no longer benefit the patient</GoalItem>
                  <GoalItem>Support patients to live as actively and meaningfully as possible for as long as possible</GoalItem>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CORE VALUES
      ══════════════════════════════════════════════════════ */}
      <section
        className="py-24 px-6"
        style={{ background: 'var(--color-surface-lowest)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <Pill>Our Foundation</Pill>
            <h2
              className="font-bold mb-4"
              style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', color: 'var(--color-on-surface)' }}
            >
              Core Values
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              The values that define how we show up for every patient, family, and colleague.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.06)} className="flex flex-wrap justify-center gap-3">
            <ValueChip icon={<Heart size={15} />}          label="Compassion" />
            <ValueChip icon={<Star size={15} />}           label="Dignity" />
            <ValueChip icon={<Handshake size={15} />}      label="Respect" />
            <ValueChip icon={<UserCheck size={15} />}      label="Patient-centered care" />
            <ValueChip icon={<Activity size={15} />}       label="Quality of life" />
            <ValueChip icon={<ClipboardList size={15} />}  label="Holistic care" />
            <ValueChip icon={<Scale size={15} />}          label="Autonomy" />
            <ValueChip icon={<Lock size={15} />}           label="Confidentiality" />
            <ValueChip icon={<HeartHandshake size={15} />} label="Family support" />
            <ValueChip icon={<Globe size={15} />}          label="Equity and accessibility" />
            <ValueChip icon={<Users size={15} />}          label="Teamwork" />
            <ValueChip icon={<Sparkles size={15} />}       label="Integrity" />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #1A4FA8 60%, #0E3A80 100%)',
          }}
        />
        {/* decorative blobs on dark bg */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: '#43B982', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: '#7B5EA7', transform: 'translate(-30%,30%)' }} />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-6"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Heart size={30} className="text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
            Ready to get started?
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Register as a staff member and your administrator will approve your account.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold transition-all"
                style={{
                  background: '#fff',
                  color: 'var(--color-primary)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.20)',
                }}
              >
                Register as Staff
                <ArrowRight size={16} />
              </button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                }}
              >
                Sign In
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
