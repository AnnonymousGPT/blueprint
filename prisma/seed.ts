import { PrismaClient, Role, Priority, RequestStatus, DocCategory, DocStatus, ConsultMode, PaymentStatus, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.serviceRequest.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.expert.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding user profiles...');
  
  // Seed User Client (Akash)
  const userClient = await prisma.user.create({
    data: {
      name: 'Akash',
      phone: '9876543210',
      email: 'akash.fintech@advisor.in',
      pan: 'ABCDE1234F',
      gst: '27AAAAA1111A1Z1',
      role: Role.USER,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
    }
  });

  // Seed Admin user
  const userAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      phone: '9999999999',
      email: 'admin@blueprintadvisor.in',
      role: Role.ADMIN
    }
  });

  // Seed Expert 1 User (Rajesh Sharma)
  const userExp1 = await prisma.user.create({
    data: {
      name: 'CA Rajesh Sharma',
      phone: '8888888881',
      email: 'rajesh@blueprintadvisor.in',
      role: Role.EXPERT,
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256'
    }
  });
  const expert1 = await prisma.expert.create({
    data: {
      userId: userExp1.id,
      specialization: 'Corporate Taxation & ITR Auditing',
      experience: '12 Years Exp',
      rating: 4.9,
      reviewsCount: 248,
      fees: 1500,
      bio: 'CA Rajesh Sharma is a veteran auditor specializing in micro-business audits and corporate taxation.'
    }
  });

  // Seed Expert 2 User (Neha Singhal)
  const userExp2 = await prisma.user.create({
    data: {
      name: 'CA Neha Singhal',
      phone: '8888888882',
      email: 'neha@blueprintadvisor.in',
      role: Role.EXPERT,
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
    }
  });
  const expert2 = await prisma.expert.create({
    data: {
      userId: userExp2.id,
      specialization: 'GST Registration & Business Setup',
      experience: '8 Years Exp',
      rating: 4.8,
      reviewsCount: 180,
      fees: 1200,
      bio: 'Neha manages startup compliance, company formation filings, and GST returns.'
    }
  });

  // Seed Expert 3 User (Vikram Malhotra)
  const userExp3 = await prisma.user.create({
    data: {
      name: 'Adviser Vikram Malhotra',
      phone: '8888888883',
      email: 'vikram@blueprintadvisor.in',
      role: Role.EXPERT,
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256'
    }
  });
  const expert3 = await prisma.expert.create({
    data: {
      userId: userExp3.id,
      specialization: 'SME Loans & Government Schemes',
      experience: '15 Years Exp',
      rating: 4.7,
      reviewsCount: 310,
      fees: 2000,
      bio: 'Vikram focuses on corporate debt advisory, MSME project reports, and subsidy schemes.'
    }
  });

  console.log('Seeding service requests...');
  
  // Seed active request 1 (ITR filing for Akash)
  const req1 = await prisma.serviceRequest.create({
    data: {
      userId: userClient.id,
      serviceType: 'ITR',
      serviceName: 'File ITR FY 2025-26',
      description: 'Need help filing standard tax returns for salary and capital gains.',
      priority: Priority.THIS_WEEK,
      status: RequestStatus.REVIEW,
      progressPercent: 80,
      assignedExpertId: expert1.id
    }
  });

  // Seed active request 2 (GST setup for Akash)
  const req2 = await prisma.serviceRequest.create({
    data: {
      userId: userClient.id,
      serviceType: 'GST',
      serviceName: 'GST Registration Setup',
      description: 'Scaffolding GST registrations for ecommerce partnership venture.',
      priority: Priority.FLEXIBLE,
      status: RequestStatus.DOCUMENTS_PENDING,
      progressPercent: 45,
      assignedExpertId: expert2.id
    }
  });

  console.log('Seeding documents...');
  await prisma.document.createMany({
    data: [
      {
        userId: userClient.id,
        requestId: req1.id,
        name: 'PAN Card.pdf',
        key: 'docs/pan_card_test.pdf',
        size: '1.2 MB',
        category: DocCategory.PAN,
        status: DocStatus.APPROVED
      },
      {
        userId: userClient.id,
        requestId: req1.id,
        name: 'Aadhaar Front & Back.jpg',
        key: 'docs/aadhaar_card_test.jpg',
        size: '2.4 MB',
        category: DocCategory.AADHAAR,
        status: DocStatus.APPROVED
      },
      {
        userId: userClient.id,
        requestId: req2.id,
        name: 'Bank Statement FY25.pdf',
        key: 'docs/bank_statement_test.pdf',
        size: '4.8 MB',
        category: DocCategory.BANK_STATEMENT,
        status: DocStatus.APPROVED
      },
      {
        userId: userClient.id,
        requestId: req2.id,
        name: 'GST Certificate Draft.pdf',
        key: 'docs/gst_draft_test.pdf',
        size: '850 KB',
        category: DocCategory.GST,
        status: DocStatus.UNDER_REVIEW
      },
      {
        userId: userClient.id,
        requestId: req1.id,
        name: 'Previous ITR-3 Form.pdf',
        key: 'docs/itr_prev_test.pdf',
        size: '3.1 MB',
        category: DocCategory.ITR,
        status: DocStatus.REJECTED,
        reason: 'Illegible scan, please re-upload'
      }
    ]
  });

  console.log('Seeding bookings & payments...');
  
  // Seed a sample booking slot
  await prisma.booking.create({
    data: {
      userId: userClient.id,
      requestId: req1.id,
      expertId: expert1.id,
      scheduledAt: new Date('2026-06-18T11:00:00Z'),
      type: ConsultMode.VIDEO,
      status: BookingStatus.CONFIRMED
    }
  });

  // Seed sample payments
  await prisma.payment.createMany({
    data: [
      {
        userId: userClient.id,
        requestId: req1.id,
        orderId: 'order_OPt89a7Acd1',
        paymentId: 'pay_OPt98Hkd928A',
        amount: 1500,
        platformFee: 99,
        totalAmount: 1599,
        status: PaymentStatus.SUCCESS,
        method: 'Google Pay'
      },
      {
        userId: userClient.id,
        requestId: req2.id,
        orderId: 'order_OPt99b2Cdf3',
        paymentId: 'pay_OPt99Kkd111B',
        amount: 1200,
        platformFee: 99,
        totalAmount: 1299,
        status: PaymentStatus.SUCCESS,
        method: 'PhonePe'
      }
    ]
  });

  console.log('Seeding Audit logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: userClient.id,
        action: 'AUTH_LOGIN',
        details: 'User Akash logged in from OTP verification session.',
        ipAddress: '127.0.0.1'
      },
      {
        userId: userClient.id,
        action: 'DOC_UPLOAD',
        details: 'Uploaded PAN Card document.',
        ipAddress: '127.0.0.1'
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
