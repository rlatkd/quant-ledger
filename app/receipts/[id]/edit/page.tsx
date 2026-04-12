import { redirect } from "next/navigation";
import { isAdmin } from "../../../_lib/auth";
import EditForm from "./EditForm";

export default async function EditReceiptPage(props: PageProps<"/receipts/[id]/edit">) {
  const { id } = await props.params;
  if (!(await isAdmin())) redirect(`/receipts/${id}`);
  return <EditForm id={id} />;
}
