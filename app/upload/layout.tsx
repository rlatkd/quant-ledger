import { redirect } from "next/navigation";
import { isAdmin } from "../_lib/auth";

export default async function UploadLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/");
  return <div className="-mb-20">{children}</div>;
}
