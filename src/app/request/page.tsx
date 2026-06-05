import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";
import RequestItem from "@/components/RequestItem";

export default async function RequestPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <LoginRequired />;
  }

  return <RequestItem />;
}
