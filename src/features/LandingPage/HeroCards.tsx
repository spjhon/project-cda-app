import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  
} from "@/components/ui/card";

import Image from "next/image";
import HorizontalScanner from "../../../public/horizontalScanner.webp";
import VerticalImage from "../../../public/verticalCar.webp";
import GithubLogo from "./svgs/GithubLogo";
import LinkedinLogo from "./svgs/LinkedinLogo";
import shadcn from "../../../public/shadcn.jpg"
import stockPhoto from "../../../public/150.jpg"

export const HeroCards = () => {
  return (
    <div className="hidden xl:flex flex-row flex-wrap gap-30 relative w-[700px] h-[500px]">
      {/* Testimonial */}
      <Card className="absolute w-[340px] -top-[30px] drop-shadow-2xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar>
            <AvatarImage
              alt="JP"
             
              src={shadcn.src}
            />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle className="text-lg">Ricardo Montaner</CardTitle>
            <CardDescription>@Mazda_Manizales</CardDescription>
          </div>
        </CardHeader>

        <CardContent>El mejor lugar de peritajes de la ciudad de Manizales!</CardContent>
      </Card>




      {/* Team */}
      <Card className="absolute overflow-visible right-[20px] top-10 w-80 flex flex-col justify-center items-center drop-shadow-2xl shadow-black/10 dark:shadow-white/10">
        
        
        
        <CardHeader className="mt-8 flex justify-center items-center pb-2 w-60">
          <Image
            width={100}
            height={100}
            src={stockPhoto.src}
            loading="eager"
            alt="user avatar"
            className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
          />
          <CardTitle className="text-center">Jan Poll</CardTitle>
          <CardDescription className="font-normal text-primary">
            Perito en Jefe
          </CardDescription>
        </CardHeader>





        <CardContent className="text-center pb-2">
          <p>
            Nunca compraria un auto sin un correcto peritaje.
          </p>
        </CardContent>



        
          <div className="flex flex-row gap-4">
            <a
              rel="noreferrer noopener"
              href="https://github.com/leoMirandaa"
              target="_blank"
              
            >
              <span className="sr-only">Github icon</span>
              <GithubLogo />
            </a>
            <a
              rel="noreferrer noopener"
              href="https://twitter.com/leo_mirand4"
              target="_blank"
              
            >
              <span className="sr-only">X icon</span>
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-foreground w-4 h-4"
              >
                <title>X</title>
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>

            <a
              rel="noreferrer noopener"
              href="https://www.linkedin.com/in/leopoldo-miranda/"
              target="_blank"
              
            >
              <span className="sr-only">Linkedin icon</span>
              <LinkedinLogo/>
            </a>
          </div>
       



      </Card>







      {/*Vertica Image */}
      <Image
        src={VerticalImage.src}
      alt="Front Car"
      width={265}
      height={150}
      className="absolute top-[165px] left-[75px] rounded-xl border shadow-2xl  drop-shadow-xl shadow-black/10 dark:shadow-white/10"
      loading="eager"
      >
        </Image>

      {/* Horizontal Image */}
      
        <Image
        src={HorizontalScanner.src}
      alt="Scanner"
      width={350}
      height={150}
      className="absolute -right-[10px] -bottom-[35px] rounded-xl border shadow-2xl  drop-shadow-xl shadow-black/10 dark:shadow-white/10"
      
      >
        </Image>
      


    </div>
  );
};