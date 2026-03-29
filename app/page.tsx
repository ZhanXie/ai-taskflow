import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to tasks page on root access
  redirect("/tasks");
}
