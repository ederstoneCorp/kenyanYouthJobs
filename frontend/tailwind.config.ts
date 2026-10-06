import type {Config} from "tailwindcss";
const config:Config={content:["./app/**/*.{ts,tsx}"],theme:{extend:{colors:{ink:"#10221b",forest:"#116149",mint:"#dff7ed",sand:"#f7f5ef",amber:"#f4b942"},boxShadow:{soft:"0 12px 35px rgba(16,34,27,.08)"}}},plugins:[]};
export default config;