const crypto = require('crypto');
const { prisma } = require('../../../backend/src/prisma');

const useDb = Boolean(process.env.DATABASE_URL);

/** Fallback mémoire si DATABASE_URL absent (dev local sans Neon). */
const memoryUsers = new Map();
const memoryRefreshTokens = new Set();
const memoryVerificationTokens = new Map();
const memoryPasswordResetTokens = new Map();

function dbEnabled() {
  return useDb;
}

function toSafeUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return {
    ...rest,
    createdAt: rest.createdAt?.toISOString?.() || rest.createdAt,
    updatedAt: rest.updatedAt?.toISOString?.() || rest.updatedAt,
  };
}

async function findUserByEmail(email) {
  if (!useDb) return memoryUsers.get(email) || null;
  return prisma.user.findUnique({ where: { email } });
}

async function findUserById(id) {
  if (!useDb) {
    return [...memoryUsers.values()].find((u) => u.id === id) || null;
  }
  return prisma.user.findUnique({ where: { id } });
}

async function createUser({ fullName, email, phone, city, passwordHash, role, emailVerified }) {
  if (!useDb) {
    const user = {
      id: crypto.randomUUID(),
      fullName,
      email,
      phone,
      city,
      passwordHash,
      role,
      subscription: 'FREE',
      emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryUsers.set(email, user);
    return user;
  }

  return prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      city,
      passwordHash,
      role,
      emailVerified,
    },
  });
}

async function updateUser(user) {
  if (!useDb) {
    memoryUsers.set(user.email, user);
    return user;
  }
  return prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: user.fullName,
      phone: user.phone,
      city: user.city,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
      subscription: user.subscription,
      role: user.role,
    },
  });
}

async function saveRefreshToken(token, userId, expiresAt) {
  if (!useDb) {
    memoryRefreshTokens.add(token);
    return;
  }
  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
}

async function refreshTokenExists(token) {
  if (!useDb) return memoryRefreshTokens.has(token);
  const row = await prisma.refreshToken.findUnique({ where: { token } });
  return Boolean(row);
}

async function deleteRefreshToken(token) {
  if (!useDb) {
    memoryRefreshTokens.delete(token);
    return;
  }
  await prisma.refreshToken.deleteMany({ where: { token } });
}

async function deleteRefreshTokensForUser(userId) {
  if (!useDb) {
    return;
  }
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

async function saveVerificationToken(token, email, expiresAt) {
  if (!useDb) {
    memoryVerificationTokens.set(token, { email, expiresAt: expiresAt.getTime() });
    return;
  }
  await prisma.verificationToken.create({
    data: { token, email, expiresAt },
  });
}

async function consumeVerificationToken(token) {
  if (!useDb) {
    const record = memoryVerificationTokens.get(token);
    if (!record) return null;
    memoryVerificationTokens.delete(token);
    return record;
  }
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;
  await prisma.verificationToken.delete({ where: { token } });
  return { email: record.email, expiresAt: record.expiresAt.getTime() };
}

async function savePasswordResetToken(token, email, expiresAt) {
  if (!useDb) {
    memoryPasswordResetTokens.set(token, { email, expiresAt: expiresAt.getTime() });
    return;
  }
  await prisma.passwordResetToken.create({
    data: { token, email, expiresAt },
  });
}

async function consumePasswordResetToken(token) {
  if (!useDb) {
    const record = memoryPasswordResetTokens.get(token);
    if (!record) return null;
    memoryPasswordResetTokens.delete(token);
    return record;
  }
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return null;
  await prisma.passwordResetToken.delete({ where: { token } });
  return { email: record.email, expiresAt: record.expiresAt.getTime() };
}

module.exports = {
  dbEnabled,
  toSafeUser,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  saveRefreshToken,
  refreshTokenExists,
  deleteRefreshToken,
  deleteRefreshTokensForUser,
  saveVerificationToken,
  consumeVerificationToken,
  savePasswordResetToken,
  consumePasswordResetToken,
};
