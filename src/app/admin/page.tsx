import Admin from "@/components/Admin";
import { getGamesFromDB } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTimelineEvents } from "@/app/actions/timeline";
import { 
  getAdminDashboardStats, getUsers, getReports, getAdminLogs, getCompanies, 
  getGameRequests, getPlatformRequests, getCompanyRequests, getPlatforms, getEditRequests
} from "@/app/actions/admin-dashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MODERATOR" && session?.user?.role !== "MANAGER") {
    redirect("/");
  }

  const games = await getGamesFromDB();
  const collection = await getUserCollection();
  const timelineEvents = await getTimelineEvents();
  
  const stats = await getAdminDashboardStats();
  const users = await getUsers();
  const reports = await getReports();
  const logs = await getAdminLogs();
  const companies = await getCompanies();
  const platforms = await getPlatforms();
  const gameRequests = await getGameRequests();
  const platformRequests = await getPlatformRequests();
  const companyRequests = await getCompanyRequests();
  const editRequests = await getEditRequests();

  // Admin page uses client-side state internally, but takes data as props
  return (
    <Admin 
      games={games} 
      collection={collection} 
      timelineEvents={timelineEvents}
      stats={stats}
      users={users}
      reports={reports}
      logs={logs}
      companies={companies}
      platforms={platforms}
      gameRequests={gameRequests}
      platformRequests={platformRequests}
      companyRequests={companyRequests}
      editRequests={editRequests}
    />
  );
}
