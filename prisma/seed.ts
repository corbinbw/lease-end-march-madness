import { PrismaClient, Region } from '@prisma/client'

const prisma = new PrismaClient()

// Sample employee names for different regions
const sampleEmployees = {
  IADVISORS: [
    'Sarah Johnson', 'Mike Chen', 'Emma Davis', 'James Wilson', 'Lisa Park',
    'David Brown', 'Anna Smith', 'Chris Lee', 'Maria Garcia', 'Tom Anderson',
    'Jessica White', 'Ryan Taylor', 'Amy Zhang', 'Mark Johnson', 'Kate Miller', 'Alex Rodriguez'
  ],
  XADVISORS: [
    'Jennifer Lopez', 'Robert Kim', 'Michelle Obama', 'Steve Jobs', 'Rachel Green',
    'John Doe', 'Mary Johnson', 'Kevin Durant', 'Sophia Chen', 'Daniel Craig',
    'Natalie Portman', 'Brad Pitt', 'Emma Stone', 'Will Smith', 'Taylor Swift', 'Ed Sheeran'
  ],
  FINANCIAL_SPECIALISTS: [
    'Warren Buffett', 'Janet Yellen', 'Jamie Dimon', 'Oprah Winfrey', 'Elon Musk',
    'Sheryl Sandberg', 'Tim Cook', 'Susan Wojcicki', 'Reed Hastings', 'Satya Nadella',
    'Melinda Gates', 'Jack Ma', 'Arianna Huffington', 'Marc Benioff', 'Ginni Rometty', 'Mary Barra'
  ],
  WADVISORS: [
    'LeBron James', 'Serena Williams', 'Tom Brady', 'Simone Biles', 'Tiger Woods',
    'Megan Rapinoe', 'Steph Curry', 'Naomi Osaka', 'Lewis Hamilton', 'Cristiano Ronaldo',
    'Lionel Messi', 'Katie Ledecky', 'Usain Bolt', 'Michael Phelps', 'Venus Williams', 'Rafael Nadal'
  ]
}

async function createEntrants() {
  console.log('Creating entrants...')
  
  for (const [region, employees] of Object.entries(sampleEmployees)) {
    for (let i = 0; i < 16; i++) {
      await prisma.entrant.create({
        data: {
          displayName: employees[i],
          region: region as Region,
          seed: i + 1,
          department: `${region} Department`,
          title: i < 4 ? 'Senior Advisor' : i < 8 ? 'Advisor' : i < 12 ? 'Associate' : 'Junior Associate'
        }
      })
    }
  }
}

async function createMatches() {
  console.log('Creating matches...')
  
  // Get all entrants grouped by region
  const entrantsByRegion = await Promise.all([
    prisma.entrant.findMany({ where: { region: 'IADVISORS' }, orderBy: { seed: 'asc' } }),
    prisma.entrant.findMany({ where: { region: 'XADVISORS' }, orderBy: { seed: 'asc' } }),
    prisma.entrant.findMany({ where: { region: 'FINANCIAL_SPECIALISTS' }, orderBy: { seed: 'asc' } }),
    prisma.entrant.findMany({ where: { region: 'WADVISORS' }, orderBy: { seed: 'asc' } })
  ])

  // Standard first round matchups (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
  const seedMatchups = [
    [1, 16], [8, 9], [5, 12], [4, 13],
    [6, 11], [3, 14], [7, 10], [2, 15]
  ]

  const regions: Region[] = ['IADVISORS', 'XADVISORS', 'FINANCIAL_SPECIALISTS', 'WADVISORS']
  
  // Create Round of 64 matches
  for (let regionIndex = 0; regionIndex < regions.length; regionIndex++) {
    const region = regions[regionIndex]
    const regionEntrants = entrantsByRegion[regionIndex]
    
    for (let matchIndex = 0; matchIndex < seedMatchups.length; matchIndex++) {
      const [leftSeed, rightSeed] = seedMatchups[matchIndex]
      const leftEntrant = regionEntrants.find(e => e.seed === leftSeed)
      const rightEntrant = regionEntrants.find(e => e.seed === rightSeed)
      
      if (leftEntrant && rightEntrant) {
        await prisma.match.create({
          data: {
            round: 'R64',
            region: region,
            matchNumber: matchIndex + 1,
            leftEntrantId: leftEntrant.id,
            rightEntrantId: rightEntrant.id,
            scheduledStart: new Date('2026-03-09T12:00:00Z')
          }
        })
      }
    }
  }

  // Create placeholder matches for later rounds
  const laterRounds = [
    { round: 'R32', count: 4, region: true },
    { round: 'S16', count: 2, region: true },
    { round: 'E8', count: 1, region: true },
    { round: 'F4', count: 2, region: false },
    { round: 'CHAMP', count: 1, region: false }
  ]

  for (const roundInfo of laterRounds) {
    if (roundInfo.region) {
      // Regional matches
      for (const region of regions) {
        for (let i = 1; i <= roundInfo.count; i++) {
          await prisma.match.create({
            data: {
              round: roundInfo.round as any,
              region: region,
              matchNumber: i
            }
          })
        }
      }
    } else {
      // Final Four and Championship
      for (let i = 1; i <= roundInfo.count; i++) {
        await prisma.match.create({
          data: {
            round: roundInfo.round as any,
            matchNumber: i
          }
        })
      }
    }
  }
}

async function createSettings() {
  console.log('Creating settings...')
  
  await prisma.settings.create({
    data: {
      id: 'singleton',
      lockDatetime: new Date('2026-03-09T09:00:00-07:00'), // 9 AM Mountain Time on March 9
      scoringJson: JSON.stringify({
        R64: 1,
        R32: 2,
        S16: 4,
        E8: 8,
        F4: 16,
        CHAMP: 32
      })
    }
  })
}

async function createTestUsers() {
  console.log('Creating test users...')
  
  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@leaseend.com',
      name: 'Trevor Admin',
      role: 'ADMIN'
    }
  })

  // Create a few test regular users
  const testUsers = [
    { email: 'john.doe@leaseend.com', name: 'John Doe' },
    { email: 'jane.smith@leaseend.com', name: 'Jane Smith' },
    { email: 'mike.johnson@leaseend.com', name: 'Mike Johnson' },
    { email: 'sarah.wilson@leaseend.com', name: 'Sarah Wilson' },
  ]

  for (const userData of testUsers) {
    await prisma.user.create({
      data: {
        ...userData,
        role: 'USER'
      }
    })
  }
}

async function main() {
  console.log('🌱 Starting database seed...')
  
  try {
    // Clear existing data (in reverse order of dependencies)
    await prisma.pick.deleteMany()
    await prisma.bracket.deleteMany()
    await prisma.adminActionLog.deleteMany()
    await prisma.match.deleteMany()
    await prisma.entrant.deleteMany()
    await prisma.user.deleteMany()
    await prisma.settings.deleteMany()
    
    console.log('🧹 Cleared existing data')

    // Create new data
    await createSettings()
    await createEntrants()
    await createMatches()
    await createTestUsers()

    console.log('✅ Database seeded successfully!')
    console.log('')
    console.log('🔑 Admin login: admin@leaseend.com')
    console.log('👥 Test users: john.doe@leaseend.com, jane.smith@leaseend.com, etc.')
    console.log('📅 Lock time set to: March 9, 2026 at 9:00 AM MT')
    console.log('')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })