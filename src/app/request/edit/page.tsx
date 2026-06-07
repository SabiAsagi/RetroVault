import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";
import EditRequestItem from "@/components/EditRequestItem";
import { Suspense } from 'react';

export default async function EditRequestPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <LoginRequired />;
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading...</div>}>
      <EditRequestItem />
    </Suspense>
  );
}
