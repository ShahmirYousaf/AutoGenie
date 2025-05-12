import Header from "@/components/header";
import "./globals.css";
import {Inter} from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
  title: "AutoGenie",
  description: "Find your dream Car",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <head>
      <link rel="icon" href="/logoAg.png" />
      </head>
      <body
        className={`${inter.className}`}>

        <Header/>

       <main className="min-h-screen">{children}</main> 
       <Toaster richColors/>


      </body>
    </html>
    </ClerkProvider>
  );
}
