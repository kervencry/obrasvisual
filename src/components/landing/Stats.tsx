import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 2500, suffix: "+", label: "obras acompanhadas" },
  { value: 98, suffix: "%", label: "de satisfação" },
  { value: 40, suffix: "%", label: "menos visitas" },
  { value: 150, suffix: "+", label: "cidades atendidas" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const duration = 1400;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return <span ref={ref}>{value.toLocaleString("pt-BR")}{suffix}</span>;
}

export default function Stats() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(s => (
          <div key={s.label}>
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <Counter target={s.value} suffix={s.suffix} />
            </div>
            <p className="text-sm opacity-90 mt-2">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
