import { redirect } from "next/navigation";

// The app opens on the chat. The landing page, the meter and the docs live on blindwoods.app.
export default function Home() {
  redirect("/chat");
}
