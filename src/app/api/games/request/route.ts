import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, platform, releaseYear, developer, referenceUrl, description } = await request.json();

    if (!title || !platform || !releaseYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create platform
    let platformRecord = await prisma.platform.findFirst({ where: { name: platform } });
    if (!platformRecord) {
      platformRecord = await prisma.platform.create({
        data: {
          name: platform,
          manufacturer: "Unknown",
          releaseYear: parseInt(releaseYear),
        }
      });
    }

    // Find or create developer company
    let developerId = undefined;
    if (developer) {
      let company = await prisma.company.findFirst({ where: { name: developer } });
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: developer,
            type: "DEVELOPER",
            country: "Unknown",
          }
        });
      }
      developerId = company.id;
    }

    const gameRequest = await prisma.game.create({
      data: {
        title,
        platformId: platformRecord.id,
        releaseYear: parseInt(releaseYear),
        developerId,
        referenceUrl,
        description,
        genre: 'Unknown',
        status: 'PENDING',
        requestedById: session.user.id
      }
    });

    return NextResponse.json(gameRequest);
  } catch (error) {
    console.error('Game Request Error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
