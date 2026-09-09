import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Home, Activity, Users, ClipboardList, ArrowRight, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

// Healthcare equipment image grid (Unsplash – free to use under Unsplash License)
// No people in any of these photos.
const CareEquipmentGrid: React.FC = () => {
  const images = [
    {
      // Vital signs monitor screen showing heart rate and clinical readouts
      // Photo by Anna Shvets on Pexels (free to use · pexels.com/photo/6291261)
      src: 'https://images.pexels.com/photos/6291261/pexels-photo-6291261.jpeg?w=600&auto=compress&cs=tinysrgb&fit=crop&h=400',
      alt: 'Hospital monitor displaying patient vital signs and heart rate data',
    },
    {
      // Pulse oximeter worn on finger — home-care SpO₂ / pulse monitoring device
      // Photo on Pexels (free to use · pexels.com/photo/4390162)
      src: 'https://images.pexels.com/photos/4390162/pexels-photo-4390162.jpeg?w=600&auto=compress&cs=tinysrgb&fit=crop&h=400',
      alt: 'Pulse oximeter on finger measuring blood oxygen saturation for home patient monitoring',
    },
    {
      // IV infusion drip — intravenous care equipment used in palliative home visits
      // Photo on Unsplash (free to use under Unsplash License)
      src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop',
      alt: 'Intravenous infusion drip equipment used during palliative home care visits',
    },
    {
      // Assorted medications and capsules — palliative care medication management
      // Photo on Pexels (free to use · pexels.com/photo/3850715)
      src: 'https://images.pexels.com/photos/3850715/pexels-photo-3850715.jpeg?w=600&auto=compress&cs=tinysrgb&fit=crop&h=400',
      alt: 'Assorted medications and capsules representing palliative care pain management',
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 gap-2 rounded-xl overflow-hidden" style={{ height: '18rem' }}>
      {images.map((img) => (
        <div key={img.src} className="overflow-hidden rounded-lg">
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

// Info strip card
const InfoCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center gap-2 px-2">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary mb-1">
      {icon}
    </div>
    <p className="text-sm font-semibold text-on-surface">{title}</p>
    <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
  </div>
);

// Feature card
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-surface-lowest rounded-xl border border-border-base shadow-card p-6 hover:shadow-card-hover transition-shadow"
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-on-surface mb-1.5">{title}</h3>
    <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
  </motion.div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
     

              <h1 className="text-4xl lg:text-5xl font-extrabold text-on-surface leading-tight tracking-tight mb-5">
                Compassionate Care,{' '}
                <span className="text-primary">Coordinated Support</span>
              </h1>

              <p className="text-base text-text-secondary leading-relaxed mb-8 max-w-lg">
                A comprehensive platform for palliative care teams to monitor patients, coordinate home visits,
                manage medications, and ensure holistic end-of-life care.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Button size="lg" onClick={() => navigate('/login')} rightIcon={<ArrowRight size={16} />}>
                  Sign In
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                  Register as Staff
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-5 text-xs text-text-muted">
                {['Built with clinical teams', 'Home-visit ready', 'Privacy-first records'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <Shield size={12} className="text-primary" />
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right – vitals card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden lg:block"
            >
              <div className="bg-surface-lowest rounded-2xl border border-border-base shadow-xl p-7">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Clinical Care Environment</p>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                    <span className="flex h-2 w-2 rounded-full bg-success status-pulse" />
                    ACTIVE
                  </span>
                </div>
                <CareEquipmentGrid />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info strip */}
      <section className="bg-surface-lowest border-y border-border-base py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <InfoCard
            icon={<Heart size={18} />}
            title="Compassionate Care"
            desc="Supporting patients and families through coordinated palliative care services."
          />
          <InfoCard
            icon={<ClipboardList size={18} />}
            title="Care Coordination"
            desc="Organising visits, medications, referrals, and follow-up care in one place."
          />
          <InfoCard
            icon={<Activity size={18} />}
            title="Patient Monitoring"
            desc="A centralised place to track patient progress and clinical observations."
          />
          <InfoCard
            icon={<Users size={18} />}
            title="Clinical Collaboration"
            desc="Enabling staff members to work together efficiently across care teams."
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-on-surface mb-3">Everything your care team needs</h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm">
              From home visit checklists to referral approvals — every clinical workflow in one place.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={<Home size={20} />} title="Home Visit Checklists" desc="Comprehensive 15-section digital visit forms matching the Y12HMC physical checklist — vitals, pain, ADL, red flags, and more." />
            <FeatureCard icon={<Activity size={20} />} title="KPS/PPS Progress Tracking" desc="Visualise patient functional decline over time with auto-calculated trend lines and clinician alerts." />
            <FeatureCard icon={<Users size={20} />} title="Care Team Coordination" desc="Team leaders, physicians, and nurses each have role-specific views and approval workflows." />
            <FeatureCard icon={<ClipboardList size={20} />} title="Medication & Lab Orders" desc="Order medications and lab tests at home or hospital, track status, and enter results electronically." />
            <FeatureCard icon={<GitBranch size={20} />} title="Referral Management" desc="Staff request referrals; admins approve or decline. Patient location updates automatically on acceptance." />
            <FeatureCard icon={<Shield size={20} />} title="Secure & Private" desc="Role-based access control, JWT authentication, and email verification before any clinical access." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-2xl mx-auto text-center">
          <Heart size={32} className="text-white/60 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-primary-light/80 text-sm mb-7">
            Register as a staff member and your administrator will approve your account.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" size="lg" onClick={() => navigate('/register')}>
              Register as Staff
            </Button>
            <Button
              className="border border-white/30 bg-transparent text-white hover:bg-white/10"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
