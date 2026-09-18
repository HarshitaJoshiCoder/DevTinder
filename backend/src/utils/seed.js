// Populates a handful of demo developer profiles so the swipe deck isn't
// empty on a fresh clone. Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const DEMO_PASSWORD = 'password123';

const demoUsers = [
  { name: 'Asha Rao', role: 'Frontend Engineer', bio: 'React & design systems.', skills: ['React', 'TypeScript', 'Tailwind'], location: 'Bengaluru' },
  { name: 'Devon Park', role: 'Backend Engineer', bio: 'APIs, queues, and databases.', skills: ['Node.js', 'PostgreSQL', 'Redis'], location: 'Seoul' },
  { name: 'Mei Lin', role: 'Full Stack Engineer', bio: 'MERN stack, real-time apps.', skills: ['MongoDB', 'Express', 'React', 'Socket.io'], location: 'Singapore' },
  { name: 'Karan Shah', role: 'DevOps Engineer', bio: 'Docker, Kubernetes, CI/CD.', skills: ['Docker', 'Kubernetes', 'AWS'], location: 'Pune' },
  { name: 'Sofia Alvarez', role: 'Mobile Engineer', bio: 'React Native and Swift.', skills: ['React Native', 'Swift', 'TypeScript'], location: 'Madrid' },
  { name: 'Liam O\u2019Connor', role: 'Data Engineer', bio: 'Pipelines and lakehouses.', skills: ['Python', 'Spark', 'Airflow'], location: 'Dublin' },
];

async function seed() {
  await connectDB();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of demoUsers) {
    const email = `${u.name.split(' ')[0].toLowerCase()}@devtinder.demo`;
    const exists = await User.findOne({ email });
    if (exists) continue;
    await User.create({ ...u, email, passwordHash });
    console.log(`[seed] created ${email}`);
  }

  console.log(`[seed] done. Demo login password for all seeded users: ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
