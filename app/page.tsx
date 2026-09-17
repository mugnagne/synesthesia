import Translator from "./translator";
import { PERFUME_COUNT, BRAND_COUNT } from "@/lib/catalogue";

export default function Home() {
  return <Translator perfumeCount={PERFUME_COUNT} brandCount={BRAND_COUNT} />;
}
