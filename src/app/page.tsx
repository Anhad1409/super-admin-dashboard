import { redirect } from "next/navigation";

export default function Home() {
  // The journey always starts at the counter — never straight into the
  // dashboard. v2 is the flagship sign-in; v1 stays at /login.
  redirect("/login/v2");
}
