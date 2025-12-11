import { redirect } from "next/navigation";

/**
 * Admin Landing Page
 *
 * Redirects to dispatcher page for route optimization demo.
 */
export default function AdminPage() {
  redirect("/admin/dispatch");
}
