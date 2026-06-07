import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanySlug } from "@/lib/slug";

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { developedGames: true, publishedGames: true } }
    }
  });

  const result = companies.map(c => ({
    ...c,
    slug: getCompanySlug(c)
  }));

  return NextResponse.json(result);
}
