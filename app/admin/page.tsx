import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard and CRM",
  robots: { index: false, follow: false }
};

export default function AdminPage() {
  redirect("/admin-dashboard.html");
}
