import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, MessageCircle, FileText, ArrowRight, Star } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background noise-texture">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-cosmic flex items-center justify-center">
            <span className="text-xl">🌙</span>
          </div>
          <span className="font-sora text-xl font-bold text-gradient-cosmic">CrescentEd</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-primary hover:bg-primary/90 glow-primary">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="animate-float mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-cosmic text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Entrepreneurship Education
          </span>
        </div>
        
        <h1 className="font-sora text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Turn Your Ideas Into
          <span className="text-gradient-cosmic block">Real Businesses</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          CrescentEd is your AI-powered learning companion that guides young entrepreneurs 
          from creative spark to successful startup — one personalized lesson at a time.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 glow-primary text-lg px-8 py-6">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-border hover:bg-secondary">
              I Have an Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <h2 className="font-sora text-3xl font-bold text-center mb-12">
          Everything You Need to <span className="text-gradient-cosmic">Succeed</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Personalized Learning"
            description="AI analyzes your goals and creates a custom curriculum just for you"
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="7-Domain Framework"
            description="Master business foundations, customer success, personal growth & more"
          />
          <FeatureCard
            icon={<MessageCircle className="w-6 h-6" />}
            title="AI Tutor"
            description="Get instant answers from your supportive big-sibling style AI mentor"
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Ready-to-Use Templates"
            description="Download worksheets, checklists, and business templates as PDFs"
          />
        </div>
      </section>

      {/* Domains Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <h2 className="font-sora text-3xl font-bold text-center mb-4">
          The 7 Domains of <span className="text-gradient-cosmic">Entrepreneurship</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          A holistic approach to building not just a business, but a sustainable entrepreneurial life
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { emoji: '🏗️', name: 'Business Foundations', desc: 'Ideas, planning, validation' },
            { emoji: '⚙️', name: 'Running a Business', desc: 'Operations, finance, legal' },
            { emoji: '🎯', name: 'Customer Success', desc: 'Marketing, sales, retention' },
            { emoji: '🌱', name: 'Personal Development', desc: 'Mindset, skills, growth' },
            { emoji: '⏰', name: 'Daily Life Optimization', desc: 'Productivity, balance, habits' },
            { emoji: '💭', name: 'Philosophy & Worldview', desc: 'Purpose, values, ethics' },
            { emoji: '✨', name: 'Other Topics', desc: 'Specialized knowledge' },
          ].map((domain) => (
            <div key={domain.name} className="glass-cosmic rounded-xl p-5 hover-lift">
              <span className="text-2xl mb-3 block">{domain.emoji}</span>
              <h3 className="font-outfit font-medium text-foreground mb-1">{domain.name}</h3>
              <p className="text-sm text-muted-foreground">{domain.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="glass-cosmic rounded-2xl p-10 text-center glow-primary">
          <Star className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="font-sora text-3xl font-bold mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of young entrepreneurs who are turning their dreams into reality with CrescentEd.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90 glow-primary text-lg px-8">
              Create Your Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <span className="font-sora font-bold text-gradient-cosmic">CrescentEd</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 CrescentEd. Empowering young entrepreneurs worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="glass-cosmic rounded-xl p-6 hover-lift group">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:glow-primary transition-all">
      {icon}
    </div>
    <h3 className="font-outfit font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
