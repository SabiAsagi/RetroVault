import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanySlug } from "@/lib/slug";

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      type: true,
      country: true,
      logoUrl: true,
      foundedAt: true,
      companyStatus: true,
      flagshipFranchises: true,
      keyFigures: true,
      views: true,
      _count: { select: { developedGames: true, publishedGames: true } }
    }
  });

  const result = companies.map(c => ({
    ...c,
    slug: getCompanySlug(c as any)
  }));

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    }
  });
}
