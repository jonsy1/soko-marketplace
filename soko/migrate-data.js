// One-off script: copies all real data from the OLD database (Neon) into the
// NEW database (Supabase, read from your normal DATABASE_URL in .env).
//
// Usage (Windows Command Prompt), from inside the `soko` folder:
//   set OLD_DATABASE_URL=your-old-neon-connection-string
//   node migrate-data.js
//
// Safe to run once. It wipes the (currently just-seeded, mostly empty)
// Supabase tables first, then copies everything from Neon over.

const { PrismaClient } = require('@prisma/client');

const oldUrl = process.env.OLD_DATABASE_URL;
if (!oldUrl) {
  console.error('Please set OLD_DATABASE_URL first. See the comment at the top of this file.');
  process.exit(1);
}

const source = new PrismaClient({ datasources: { db: { url: oldUrl } } });
const target = new PrismaClient(); // uses DATABASE_URL from .env (Supabase)

async function main() {
  console.log('Connecting to both databases...');

  console.log('Clearing new (Supabase) database...');
  await target.pushSubscription.deleteMany();
  await target.loginAttempt.deleteMany();
  await target.message.deleteMany();
  await target.orderItem.deleteMany();
  await target.order.deleteMany();
  await target.conversationMessage.deleteMany();
  await target.conversation.deleteMany();
  await target.like.deleteMany();
  await target.follow.deleteMany();
  await target.stockEntry.deleteMany();
  await target.product.deleteMany();
  await target.category.deleteMany();
  await target.business.deleteMany();
  await target.user.deleteMany();

  console.log('Copying Users...');
  const users = await source.user.findMany();
  for (const u of users) {
    await target.user.create({ data: u });
  }
  console.log(`  ${users.length} users copied.`);

  console.log('Copying Categories...');
  const categories = await source.category.findMany();
  for (const c of categories) {
    await target.category.create({ data: { ...c, parentId: null } });
  }
  for (const c of categories) {
    if (c.parentId) {
      await target.category.update({ where: { id: c.id }, data: { parentId: c.parentId } });
    }
  }
  console.log(`  ${categories.length} categories copied.`);

  console.log('Copying Businesses...');
  const businesses = await source.business.findMany();
  for (const b of businesses) {
    await target.business.create({ data: b });
  }
  console.log(`  ${businesses.length} businesses copied.`);

  console.log('Copying Products...');
  const products = await source.product.findMany();
  for (const p of products) {
    await target.product.create({ data: p });
  }
  console.log(`  ${products.length} products copied.`);

  console.log('Copying Stock Entries...');
  const stockEntries = await source.stockEntry.findMany();
  for (const s of stockEntries) {
    await target.stockEntry.create({ data: s });
  }
  console.log(`  ${stockEntries.length} stock entries copied.`);

  console.log('Copying Follows...');
  const follows = await source.follow.findMany();
  for (const f of follows) {
    await target.follow.create({ data: f });
  }
  console.log(`  ${follows.length} follows copied.`);

  console.log('Copying Likes...');
  const likes = await source.like.findMany();
  for (const l of likes) {
    await target.like.create({ data: l });
  }
  console.log(`  ${likes.length} likes copied.`);

  console.log('Copying Conversations...');
  const conversations = await source.conversation.findMany();
  for (const c of conversations) {
    await target.conversation.create({ data: c });
  }
  console.log(`  ${conversations.length} conversations copied.`);

  console.log('Copying Conversation Messages...');
  const convoMessages = await source.conversationMessage.findMany();
  for (const m of convoMessages) {
    await target.conversationMessage.create({ data: m });
  }
  console.log(`  ${convoMessages.length} conversation messages copied.`);

  console.log('Copying Orders...');
  const orders = await source.order.findMany();
  for (const o of orders) {
    await target.order.create({ data: o });
  }
  console.log(`  ${orders.length} orders copied.`);

  console.log('Copying Order Items...');
  const orderItems = await source.orderItem.findMany();
  for (const oi of orderItems) {
    await target.orderItem.create({ data: oi });
  }
  console.log(`  ${orderItems.length} order items copied.`);

  console.log('Copying Messages...');
  const messages = await source.message.findMany();
  for (const m of messages) {
    await target.message.create({ data: m });
  }
  console.log(`  ${messages.length} messages copied.`);

  console.log('\n✅ All data copied successfully!');
}

main()
  .catch((e) => {
    console.error('\n❌ Something went wrong:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });