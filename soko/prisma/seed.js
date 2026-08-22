const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@soko.co.tz' },
    update: {},
    create: {
      name: 'Soko Admin',
      email: 'admin@soko.co.tz',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const categoryNames = ['Electronics', 'Fashion', 'Home & Furniture', 'Vehicles', 'Food & Groceries', 'Agriculture'];
  const categories = {};
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    categories[name] = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  const sellerPassword = await bcrypt.hash('seller123', 10);
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@soko.co.tz' },
    update: {},
    create: {
      name: 'ABC Electronics Owner',
      email: 'seller@soko.co.tz',
      passwordHash: sellerPassword,
      role: 'BUSINESS',
      phone: '0700000000',
    },
  });

  let business = await prisma.business.findUnique({ where: { ownerId: sellerUser.id } });
  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'ABC Electronics',
        slug: 'abc-electronics-demo',
        description: 'Phones, laptops and accessories in Dar es Salaam.',
        location: 'Kariakoo, Dar es Salaam',
        phone: '0700000000',
        status: 'VERIFIED',
        offersDelivery: true,
        ownerId: sellerUser.id,
      },
    });

    await prisma.product.createMany({
      data: [
        {
          name: 'iPhone 13',
          description: 'Used, excellent condition, 128GB.',
          price: 950000,
          quantity: 4,
          categoryId: categories['Electronics'].id,
          businessId: business.id,
        },
        {
          name: 'Samsung Galaxy A54',
          description: 'Brand new, sealed box.',
          price: 620000,
          quantity: 10,
          categoryId: categories['Electronics'].id,
          businessId: business.id,
        },
        {
          name: 'Nike Air Force 1',
          description: 'White, size 42.',
          price: 180000,
          quantity: 6,
          categoryId: categories['Fashion'].id,
          businessId: business.id,
        },
      ],
    });
  }

  console.log('Seed complete.');
  console.log('Admin login: admin@soko.co.tz / admin123');
  console.log('Demo seller login: seller@soko.co.tz / seller123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
