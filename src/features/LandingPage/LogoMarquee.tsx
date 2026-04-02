
import { Marquee } from "@/components/ui/marquee";
import NextjsLogo from "@/features/LandingPage/svgStack/NextjsLogo"
import TailwindLogo from "@/features/LandingPage/svgStack/TailwindLogo"
import ReactLogo from  "@/features/LandingPage/svgStack/ReactLogo"
import JavascriptLogo from "./svgStack/JavascriptLogo";
import BemLogo from "./svgStack/BemLogo";
import CloudfareLogo from "./svgStack/CloudfareLogo";
import CSSLogo from "./svgStack/CSSLogo";
import GitLogo from "./svgStack/GitLogo";
import TypeScriptLogo from "./svgStack/TypeScriptLogo";
import VisualstudioLogo from "./svgStack/VisualstudioLogo";


const logos = [
  {
    
    id: "01",
    logo: <NextjsLogo/>,
    label: "Next js",
    link: "https://nextjs.org/"
  },

  {
    id: "02",
    logo: <TailwindLogo/>,
    label: "Tailwind",
    link: "https://tailwindcss.com/"
  },

  {
    id: "03",
    logo: <ReactLogo/>,
    label: "React",
    link: "https://es.react.dev/"
  },

  {
    id: "04",
    logo: <JavascriptLogo/>,
    label: "Javascript",
    link: "https://developer.mozilla.org/es/docs/Web/JavaScript"
  },
  
  {
    id: "05",
    logo: <BemLogo/>,
    label: "Bem",
    link: "https://en.bem.info/methodology/"
  },

  {
    id: "06",
    logo: <CloudfareLogo/>,
    label: "Cloudfare",
    link: "https://www.cloudflare.com/"
  },

  {
    id: "07",
    logo: <GitLogo/>,
    label: "GIT",
    link: "https://git-scm.com/V"
  },

  {
    id: "08",
    logo: <TypeScriptLogo/>,
    label: "TypeScript",
    link: "https://www.typescriptlang.org/"
  },

  {
    id: "09",
    logo: <VisualstudioLogo/>,
    label: "Visual Studio",
    link: "https://code.visualstudio.com/"
  },

  {
    id: "10",
    logo: <CSSLogo/>,
    label: "CSS",
    link: "https://developer.mozilla.org/en-US/docs/Web/CSS"
  }
    
    
];




const ReviewCard = ({ 
  logo, 
  label, 
  link 
}: { 
  logo: React.ReactNode, 
  label: string, 
  link: string 
}) => {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="mx-5 flex flex-col items-center gap-2 group transition-all"
    >
      <div className="group-hover:grayscale-0 transition-all duration-300">
        {logo}
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
        {label}
      </span>
    </a>
  );
};





export function LogoMarquee() {
  return (
    <section className="my-15" id="stack">
      <h2 className="text-center text-3xl md:text-4xl font-bold py-10  ">
        Herramientas modernas y {" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          CONFIABLES{" "}
        </span>
        
      </h2>
    <div className="container mx-auto relative flex w-full flex-col items-center justify-center overflow-hidden">
      
      <Marquee reverse pauseOnHover className="[--duration:30s]">
        {logos.map((logo) => (
          <ReviewCard key={logo.id} {...logo} />
        ))}
      </Marquee>
      
    </div>
    </section>
  );
}