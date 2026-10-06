import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"FundiConnect | Find trusted local artisans",description:"Discover verified local fundis by trade, distance, availability and reputation."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}