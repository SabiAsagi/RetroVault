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
    const { requestType, ...data } = await request.json();

    if (requestType === 'platform') {
      const { name, manufacturer, releaseYear, description, referenceUrl } = data;
      if (!name || !manufacturer || !releaseYear) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      const platformReq = await prisma.platform.create({
        data: {
          name, manufacturer, releaseYear: parseInt(releaseYear), description,
          status: 'PENDING', requestedById: session.user.id
        }
      });
      return NextResponse.json(platformReq);
    } 
    else if (requestType === 'company') {
      const { name, type, country, websiteUrl, description } = data;
      if (!name || !type) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      const companyReq = await prisma.company.create({
        data: {
          name, type, country, websiteUrl, description,
          status: 'PENDING', requestedById: session.user.id
        }
      });
      return NextResponse.json(companyReq);
    }
    else {
      // Default to Game
      const { title, platform, releaseYear, developer, referenceUrl, description } = data;
      if (!title || !platform || !releaseYear) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

      let platformRecord = await prisma.platform.findFirst({ where: { name: platform } });
      if (!platformRecord) {
        platformRecord = await prisma.platform.create({
          data: { name: platform, manufacturer: "Unknown", releaseYear: parseInt(releaseYear) }
        });
      }

      let developerId = undefined;
      if (developer) {
        let company = await prisma.company.findFirst({ where: { name: developer } });
        if (!company) {
          company = await prisma.company.create({
            data: { name: developer, type: "DEVELOPER", country: "Unknown" }
          });
        }
        developerId = company.id;
      }

      const gameRequest = await prisma.game.create({
        data: {
          title, platformId: platformRecord.id, releaseYear: parseInt(releaseYear), developerId,
          referenceUrl, description, genre: 'Unknown', status: 'PENDING', requestedById: session.user.id
        }
      });

      return NextResponse.json(gameRequest);
    }
  } catch (error) {
    console.error('Request Error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
