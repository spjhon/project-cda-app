import { HeroVideoDialog }  from "@/components/ui/hero-video-dialog";
import stockImage from "../../../public/videothmbnaillbur.webp"
 
export function HeroVideo() {
  return (
    <section className="container mx-auto relative max-w-200 mb-30 mt-30 text-center shadow-2xl p-10">

      <h2 className="pb-6 mb-6 text-3xl md:text-4xl font-bold ">
        Conoce{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          cdApp{" "}
        </span>
        por medio de nuestro video instructivo
      </h2>

      <HeroVideoDialog
        className="block dark:hidden"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
        thumbnailSrc={stockImage.src}
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block"
        animationStyle="from-center"
        videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
        thumbnailSrc={stockImage.src}
        thumbnailAlt="Hero Video"
      />
    </section>
  );
}