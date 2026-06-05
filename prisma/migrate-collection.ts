import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting collection item migration...')
  
  const items = await prisma.collectionItem.findMany()
  
  for (const item of items) {
    let newOwnershipStatus = 'FULL' // default
    let newPlayStatus = 'UNPLAYED' // default

    // Map old condition/ownership to new ownershipStatus
    if (item.condition === 'SEALED') {
      newOwnershipStatus = 'UNOPENED'
    } else if (item.condition === 'LOOSE') {
      newOwnershipStatus = 'PARTIAL'
    } else if (item.condition === 'COMPLETED' || item.condition === 'OPENED') {
      newOwnershipStatus = 'FULL'
    } else if (item.ownershipStatus === 'OWNED') {
      newOwnershipStatus = 'FULL'
    }

    // Since we don't have play history for most, default to UNPLAYED or COMPLETED if it was clearly cleared
    if (item.clearDate) {
      newPlayStatus = 'COMPLETED'
    } else if (item.playStartDate) {
      newPlayStatus = 'PLAYING'
    } else {
      newPlayStatus = 'UNPLAYED'
    }

    await prisma.collectionItem.update({
      where: { id: item.id },
      data: {
        ownershipStatus: newOwnershipStatus,
        playStatus: newPlayStatus,
      }
    })
  }

  console.log(`Migrated ${items.length} collection items.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
