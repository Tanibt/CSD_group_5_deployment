import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, Zap, TrendingUp, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero.png";


const features = [
  {
    icon: MessageCircle,
    title: "Slang & Language",
    description: "Decode the words, phrases, and internet-speak of Gen Alpha — with real cultural context behind every term.",
  },
  {
    icon: TrendingUp,
    title: "Memes & Trends",
    description: "Understand viral moments and cultural references before they fly completely over your head.",
  },
  {
    icon: BookOpen,
    title: "Curated Lessons",
    description: "Follow structured learning paths built for intentional, meaningful understanding — not mindless scrolling.",
  },
  {
    icon: Zap,
    title: "Quizzes & Reflection",
    description: "Test what you know and track your growth with interactive exercises and reflection prompts.",
  },
];

const Index = () => {
  const isLoggedIn = !!localStorage.getItem("token");
  const navigate = useNavigate();
  const handleFeatureClick = () => navigate(isLoggedIn ? "/lessons" : "/register");
  const heroPanelBg   = "rgba(239,235,225,0.90)";
  const bodyTextColor = "#4A4A4A";
  const startBtnBg    = "#ffffff";
  const startBtnColor = "#51905c";
  const featureHover  = "#e4dfd3";
  const featureTitleC = "#1a1a1a";
  const featureDescC  = "#6b6b6b";

  return (
    <div className="min-h-screen" style={{
      backgroundColor: "#efebe1",
      "--background": "44 30% 91%",
      "--foreground": "220 40% 13%",
      "--card": "0 0% 100%",
      "--card-foreground": "220 40% 13%",
      "--muted": "220 20% 95%",
      "--muted-foreground": "220 10% 50%",
      "--border": "220 15% 90%",
      "--primary": "130 28% 44%",
      "--primary-foreground": "0 0% 100%",
    } as React.CSSProperties}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ height: "82vh", paddingTop: "8rem" }}>

        {/* Image — fills from left, natural width */}
        <motion.img
          src={heroImage}
          alt="GenBridge illustration"
          className="absolute left-0 w-auto"
          style={{ top: "5rem", height: "calc(100% - 5rem)" }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        />

        {/* Text panel — floats over the right portion of the image */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex flex-col justify-center px-10 py-10"
          style={{ width: "48%", backgroundColor: heroPanelBg, backdropFilter: "blur(6px)" }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >

          <h1
            className="font-display font-bold mb-4"
            style={{ color: "#51905c", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", lineHeight: 1.2 }}
          >
            <span className="block" style={{ marginLeft: "0rem" }}>Finally get what</span>
            <span className="block" style={{ marginLeft: "1.2rem" }}>
              Gen{" "}
              <span className="relative inline-block">
                Alpha
                {/* Animated underline */}
                <motion.svg
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  style={{ position: "absolute", left: "-4px", bottom: "-6px", width: "calc(100% + 8px)", height: "8px", overflow: "visible", pointerEvents: "none" }}
                  initial="hidden" animate="visible"
                >
                  <motion.path
                    d="M 0 7 L 100 2"
                    fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="5" strokeLinecap="round"
                    variants={{
                      hidden: { pathLength: 0, opacity: 0 },
                      visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: 0.6, delay: 0.9, ease: "easeOut" }, opacity: { duration: 0.01, delay: 0.9 } } },
                    }}
                  />
                </motion.svg>
              </span>
            </span>
            <span className="block" style={{ marginLeft: "2.4rem" }}>is saying.</span>
          </h1>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: bodyTextColor, marginLeft: "2.4rem" }}>
            From "rizz" to "sigma" — learn the slang, memes, and culture your kids, students, or coworkers are speaking fluently.
          </p>
          <div className="flex flex-wrap gap-3" style={{ marginLeft: "2.4rem" }}>
            <Link
              to="/register"
              className="btn-3d font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-xl hover:opacity-80 transition-opacity"
              style={{ backgroundColor: startBtnBg, color: startBtnColor, boxShadow: "0 5px 0 #c8bfad" }}
            >
              Start Learning →
            </Link>
            {!isLoggedIn && (
              <Link
                to="/login"
                className="btn-3d font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-xl border-2 hover:opacity-80 transition-opacity"
                style={{ borderColor: "#51905c", color: "#51905c", boxShadow: "0 5px 0 rgba(81,144,92,0.4)" }}
              >
                I have an account
              </Link>
            )}
          </div>
        </motion.div>

      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#51905c"><path d="M423.5-103.5Q400-127 400-160h160q0 33-23.5 56.5T480-80q-33 0-56.5-23.5ZM320-200v-80h320v80H320Zm10-120q-69-41-109.5-110T180-580q0-125 87.5-212.5T480-880q125 0 212.5 87.5T780-580q0 81-40.5 150T630-320H330Zm24-80h252q45-32 69.5-79T700-580q0-92-64-156t-156-64q-92 0-156 64t-64 156q0 54 24.5 101t69.5 79Zm126 0Z"/></svg>
              <span className="text-base font-semibold uppercase tracking-widest" style={{ color: "#51905c" }}>What You'll Learn</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore Gen Alpha Culture
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From slang to memes — everything you need to bridge the generational gap, one lesson at a time.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                onClick={handleFeatureClick}
                className="group p-7 flex flex-col rounded-2xl border border-transparent transition-all duration-200 cursor-pointer hover:border-[#c8bfad]"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = featureHover)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
              >
                <feature.icon
                  className="w-8 h-8 mb-5"
                  style={{ color: "#51905c" }}
                  strokeWidth={1.5}
                />
                <h3 className="font-display text-xl font-bold mb-2" style={{ color: featureTitleC }}>
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: featureDescC }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-primary p-12 text-center"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to get fluent?
              </h2>
              <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
                Join thousands of curious learners bridging the generational gap. It's free to start.
              </p>
              <Button size="lg" variant="secondary" asChild className="btn-3d" style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.15)" }}>
                <Link to="/register">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 GenBridge. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
