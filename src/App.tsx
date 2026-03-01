import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { ArrowRight, BookOpen, Mail, PenTool } from 'lucide-react';
import { useRef, useEffect } from 'react';

const PARTICLES = Array.from({ length: 70 }).map((_, i) => {
  const depthLevel = Math.random();
  const depth = depthLevel > 0.8 ? 1.5 : depthLevel > 0.4 ? 1.0 : 0.5; // Parallax layers
  return {
    id: i,
    layer: depth,
    left: Math.random() * 100, // vw
    top: Math.random() * -20, // vh
    size: Math.random() * (depth * 3) + 2, // Slightly larger particles
    opacity: Math.random() * 0.6 + 0.3, // Higher opacity
    duration: Math.random() * 20 + 15, // Slightly faster fall time
    delay: Math.random() * -45, // pre-warm the animation
    drift: Math.random() * 40 - 20, // vw horizontal drift
    isBone: Math.random() > 0.85, // Color distribution
  };
});

function AshParticles() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 -> 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden mix-blend-screen">
      {/* Subtle background glow to replace some of the lost fog depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-concrete/5 rounded-full blur-[100px] pointer-events-none" />

      {[0.5, 1.0, 1.5].map((depth) => {
        // Closer layers move more (parallax)
        const xOffset = useTransform(smoothMouseX, [-1, 1], [-20 * depth, 20 * depth]);
        const yOffset = useTransform(smoothMouseY, [-1, 1], [-20 * depth, 20 * depth]);

        return (
          <motion.div
            key={depth}
            style={{ x: xOffset, y: yOffset }}
            className="absolute inset-0"
          >
            {PARTICLES.filter(p => p.layer === depth).map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  x: `${p.left}vw`,
                  y: `${p.top}vh`,
                }}
                animate={{
                  y: [`${p.top}vh`, '120vh'], // Fall through screen
                  x: [`${p.left}vw`, `calc(${p.left}vw + ${p.drift}vw)`], // Sway sideways
                  opacity: [0, p.opacity, p.opacity, 0], // Fade in/out
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: p.delay, // Start at different times
                }}
                className={`absolute rounded-full shadow-sm ${p.isBone ? 'bg-bone' : 'bg-concrete'}`}
                style={{
                  width: p.size,
                  height: p.size,
                  filter: `blur(${depth > 1 ? '1px' : '0.5px'})`
                }}
              />
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(heroScroll, [0, 1], [1, 0]);

  return (
    <div className="min-h-screen bg-onyx selection:bg-rust selection:text-bone">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-rust origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navigation (Minimalist) */}
      <nav className="fixed top-0 w-full p-6 md:p-10 flex justify-between items-center z-50 text-bone mix-blend-difference">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="font-display text-2xl tracking-wider cursor-pointer"
        >
          MRV
        </motion.div>
        <div className="flex gap-6 font-display text-sm tracking-widest uppercase">
          {['Manifiesto', 'Obras', 'Contacto'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              whileHover={{ y: -2, color: 'var(--color-rust)' }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="transition-colors"
            >
              {item}
            </motion.a>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex flex-col justify-end pb-12 pt-32 px-6 md:px-16 overflow-hidden bg-onyx">
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 z-0 overflow-hidden bg-onyx"
        >
          {/* Base dark background */}
          <div className="absolute inset-0 bg-onyx z-0" />

          {/* Ash / Dust Particles (Cenizas del Asfalto) */}
          <AshParticles />

          {/* Film grain for Noir texture */}
          <div
            className="absolute inset-0 opacity-[0.2] pointer-events-none mix-blend-overlay z-20"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />

          {/* Heavy Vignette to focus on text and ground the fog */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0A0A_90%)] pointer-events-none opacity-95 z-30" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mt-auto pt-24" /* Added top padding to push it down from header */
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="font-body italic text-bone/90 text-[1.1rem] md:text-2xl mb-4 md:mb-8 max-w-2xl drop-shadow-md"
          >
            El arquitecto del noir transatlántico. Crónica implacable del asfalto y la frontera.
          </motion.p>
          <h1 className="font-display text-[12vw] leading-[0.85] tracking-tight uppercase text-bone drop-shadow-lg">
            Maximiliano
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px var(--color-bone)' }}>Rodríguez</span>
            <br />
            Vecino
          </h1>
        </motion.div>
      </section>

      {/* Elevator Pitch / Quote */}
      <section className="bg-bone text-onyx py-32 md:py-48 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-body text-3xl md:text-5xl lg:text-6xl leading-tight italic font-medium"
          >
            "Escribo novela negra porque es la única forma honesta de contar lo que pasa cuando se apagan las luces de las grandes capitales. Mis libros son puentes de papel entre las calles de Sudamérica y las periferias de Europa."
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="w-12 h-[1px] bg-rust" />
            <p className="font-display text-rust uppercase tracking-widest text-sm">
              El Outsider que conquistó la literatura
            </p>
          </motion.div>
        </div>
      </section>

      {/* Manifesto / ADN */}
      <section id="manifiesto" className="py-32 px-6 md:px-16 bg-onyx relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="font-display text-6xl md:text-8xl text-bone uppercase">El <span className="text-rust">Manifiesto</span></h2>
            <p className="font-body text-concrete mt-4 text-xl italic">Cero impostura. Cero romanticismo barato.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              {
                num: "01",
                title: "Verdad Visceral",
                desc: "La prosa debe oler a café cargado, a sudor y a asfalto mojado. Escribo desde la cicatriz, validando la experiencia de quienes sostienen el sistema desde abajo."
              },
              {
                num: "02",
                title: "Testimonio de los Márgenes",
                desc: "La literatura como arma de disección masiva. Tramas adictivas con un fondo implacable: los perdedores, los exiliados económicos, los invisibles."
              },
              {
                num: "03",
                title: "Vértigo Narrativo",
                desc: "Un respeto sagrado por el tiempo del lector. Tramas afiladas como navajas, sin grasa, donde cada página empuja irremediablemente a la siguiente."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 100, damping: 20 }}
                whileHover={{ y: -10 }}
                className="group cursor-default"
              >
                <motion.div
                  className="font-display text-7xl text-white/10 group-hover:text-rust transition-colors duration-500 mb-6 inline-block"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {item.num}
                </motion.div>
                <h3 className="font-body text-2xl text-bone font-bold mb-4">{item.title}</h3>
                <p className="font-body text-concrete leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Works / Obras */}
      <section id="obras" className="py-32 bg-bone text-onyx">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <h2 className="font-display text-6xl md:text-8xl uppercase leading-none">
              Crónicas<br />del <span className="text-rust">Asfalto</span>
            </h2>
            <p className="font-body text-concrete italic max-w-sm mt-8 md:mt-0 text-lg">
              Historias de ritmo frenético donde los protagonistas no son héroes, sino sobrevivientes.
            </p>
          </div>

          <div className="border-t border-onyx/20">
            {[
              { title: "El Asfalto Que Nos Parió", year: "2023", type: "Novela Negra" },
              { title: "Cicatrices de Hormigón", year: "2021", type: "Thriller Urbano" },
              { title: "La Frontera Invisible", year: "2019", type: "Relatos" }
            ].map((book, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 120, damping: 20 }}
                whileHover={{ x: 10, backgroundColor: "var(--color-onyx)", color: "var(--color-bone)" }}
                className="group flex flex-col md:flex-row justify-between items-start md:items-center py-10 border-b border-onyx/20 px-4 -mx-4 cursor-pointer transition-colors duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                  <span className="font-display text-rust text-xl">{book.year}</span>
                  <h3 className="font-body text-3xl md:text-5xl font-medium">{book.title}</h3>
                </div>
                <div className="flex items-center gap-6 mt-6 md:mt-0">
                  <span className="font-display tracking-widest uppercase text-sm opacity-60">{book.type}</span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-full border border-current flex items-center justify-center group-hover:bg-rust group-hover:border-rust transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-32 px-6 md:px-16 bg-onyx relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--color-rust)_0%,transparent_70%)] blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <PenTool className="w-12 h-12 text-rust mx-auto mb-8" />
          </motion.div>

          <h2 className="font-display text-5xl md:text-7xl text-bone uppercase mb-6">Contacto</h2>
          <p className="font-body text-concrete text-xl md:text-2xl italic mb-12">
            Para entrevistas, derechos de publicación o conferencias. El asfalto siempre tiene una historia más que contar.
          </p>

          <form className="flex flex-col gap-8 max-w-2xl mx-auto text-left" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <input
                  type="text"
                  placeholder="Nombre"
                  className="w-full bg-transparent border-b border-concrete/50 px-0 py-4 text-bone font-body focus:outline-none focus:border-rust transition-colors placeholder:text-concrete/50"
                />
              </motion.div>
              <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="w-full bg-transparent border-b border-concrete/50 px-0 py-4 text-bone font-body focus:outline-none focus:border-rust transition-colors placeholder:text-concrete/50"
                />
              </motion.div>
            </div>
            <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
              <textarea
                placeholder="Mensaje..."
                rows={4}
                className="w-full bg-transparent border-b border-concrete/50 px-0 py-4 text-bone font-body focus:outline-none focus:border-rust transition-colors placeholder:text-concrete/50 resize-none"
              />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "var(--color-bone)", color: "var(--color-onyx)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="bg-rust text-bone font-display uppercase tracking-widest px-8 py-5 mt-4 w-full md:w-auto md:self-end"
            >
              Enviar Mensaje
            </motion.button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-onyx border-t border-white/10 py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display text-3xl text-bone">MRV</div>
          <div className="font-body text-concrete text-sm text-center md:text-left">
            © {new Date().getFullYear()} Maximiliano Rodríguez Vecino. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-concrete hover:text-rust transition-colors">Instagram</a>
            <a href="#" className="text-concrete hover:text-rust transition-colors">Substack</a>
            <a href="#" className="text-concrete hover:text-rust transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
