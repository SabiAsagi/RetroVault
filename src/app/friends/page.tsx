import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";
import Friends from "@/components/Friends";

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <LoginRequired />;
  }

  return <Friends />;
}
