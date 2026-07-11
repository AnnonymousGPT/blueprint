import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.document.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.expert.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Real Users...');
  
  // 1. Client User
  await prisma.user.create({
    data: {
      phone: '8888888881',
      name: 'Daksh (Client)',
      role: 'CLIENT',
    }
  });

  // 2. Expert User
  await prisma.user.create({
    data: {
      phone: '8888888882',
      name: 'CA Rajesh Sharma',
      role: 'EXPERT',
      rating: 4.9,
      expert: {
        create: {
          specialization: 'Corporate Taxation & ITR Auditing',
          reviewsCount: 248,
          fees: 1500,
        }
      }
    }
  });

  // 3. Another Expert
  await prisma.user.create({
    data: {
      phone: '8888888883',
      name: 'CA Neha Singhal',
      role: 'EXPERT',
      rating: 4.8,
      expert: {
        create: {
          specialization: 'GST Registration & Business Setup',
          reviewsCount: 180,
          fees: 1200,
        }
      }
    }
  });

  console.log('Seed completed successfully!');
  console.log('Client Phone: 8888888881 (OTP 123456)');
  console.log('Expert Phone: 8888888882 (OTP 123456)');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
