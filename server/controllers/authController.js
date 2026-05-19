const bcrypt = require('bcrypt');
const { verifySync } = require('otplib');
const prisma = require('../config/prisma');
const {
  signAccessToken,
  verifyAccessToken,
  newJti,
  hashRefresh,
  randomRefreshRaw,
} = require('../utils/tokens');
const {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  accessCookieOptions,
  refreshCookieOptions,
  clearCookieOptions,
} = require('../config/cookies');
const { ensureCsrfCookie } = require('../middleware/csrf');

async function verifyTurnstileIfConfigured(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteip) body.set('remoteip', remoteip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  return data.success === true;
}

async function uniformLoginDelay(ms = 80) {
  await new Promise((r) => setTimeout(r, ms + Math.floor(Math.random() * 60)));
}

function setAccessCookie(res, token) {
  res.cookie(COOKIE_ACCESS, token, accessCookieOptions());
}

function setRefreshCookie(res, raw) {
  res.cookie(COOKIE_REFRESH, raw, refreshCookieOptions());
}

function clearAuthCookies(res) {
  res.clearCookie(COOKIE_ACCESS, clearCookieOptions());
  res.clearCookie(COOKIE_REFRESH, { ...refreshCookieOptions(), maxAge: 0 });
  /* CSRF se mantiene o se renueva en /prepare */
}

async function persistRefreshSession(userId, rawRefresh, req) {
  const tokenHash = hashRefresh(rawRefresh);
  const jti = newJti();
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash,
      jti,
      expiresAt,
      ip: req.ip || null,
      userAgent: req.get('user-agent')?.slice(0, 512) || null,
    },
  });
  return jti;
}

async function login(req, res, next) {
  try {
    const body = req.validatedBody || req.body;
    const turnstileOk = await verifyTurnstileIfConfigured(body.turnstileToken, req.ip);
    if (!turnstileOk) {
      await uniformLoginDelay(120);
      return res.status(400).json({ message: 'Verificaci?n antiÿÿÿbot fallida.' });
    }

    const { email, password, totpCode } = body;

    const userFull = await prisma.user.findUnique({ where: { email: email.trim() } });
    const hash = userFull?.password || '$2b$10$invalidinvalidinvalidinvalidinv';
    const ok = await bcrypt.compare(password, hash);

    if (!userFull || !ok) {
      await uniformLoginDelay(140);
      return res.status(401).json({ message: 'Credenciales inv?lidas' });
    }

    if (userFull.totpEnabled) {
      if (!userFull.totpSecret) {
        return res.status(500).json({ message: 'MFA mal configurado' });
      }
      if (!totpCode) {
        return res.status(403).json({
          message: 'Ingres? el c?digo de autenticaci?n (TOTP).',
          code: 'TOTP_REQUIRED',
        });
      }
      const totpResult = verifySync({
        token: totpCode,
        secret: userFull.totpSecret,
        window: 1,
      });
      if (!totpResult.valid) {
        await uniformLoginDelay(100);
        return res.status(401).json({ message: 'C?digo TOTP inv?lido', code: 'INVALID_TOTP' });
      }
    }

    const accessJti = newJti();
    const accessToken = signAccessToken(userFull, accessJti);
    const rawRefresh = randomRefreshRaw();
    await persistRefreshSession(userFull.id, rawRefresh, req);

    ensureCsrfCookie(req, res);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, rawRefresh);

    await prisma.revokedAccessJti.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    res.json({
      ok: true,
      user: {
        id: userFull.id,
        email: userFull.email,
        name: userFull.name,
        role: userFull.role,
        stageSlug: userFull.stageSlug ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const raw = req.cookies?.[COOKIE_REFRESH];
    if (!raw) {
      return res.status(401).json({ message: 'Refresh requerido' });
    }

    const h = hashRefresh(raw);
    const session = await prisma.refreshSession.findFirst({
      where: { tokenHash: h },
    });

    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Sesi?n inv?lida' });
    }

    if (session.expiresAt < new Date()) {
      await prisma.refreshSession.delete({ where: { id: session.id } });
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Sesi?n expirada' });
    }

    if (session.revokedAt) {
      await prisma.refreshSession.deleteMany({ where: { userId: session.userId } });
      await prisma.user.update({
        where: { id: session.userId },
        data: { tokenVersion: { increment: 1 } },
      });
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Reutilizaci?n de token detectada' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    await prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const rawNew = randomRefreshRaw();
    await persistRefreshSession(user.id, rawNew, req);

    const accessJti = newJti();
    const accessToken = signAccessToken(user, accessJti);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, rawNew);

    ensureCsrfCookie(req, res);

    res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        stageSlug: user.stageSlug ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const access = req.cookies?.[COOKIE_ACCESS];
    const raw = req.cookies?.[COOKIE_REFRESH];

    if (access) {
      try {
        const payload = verifyAccessToken(access);
        const expSec = payload.exp;
        if (payload.jti && expSec) {
          await prisma.revokedAccessJti.upsert({
            where: { jti: payload.jti },
            create: {
              jti: payload.jti,
              expiresAt: new Date(expSec * 1000),
            },
            update: {},
          });
        }
      } catch {
        /* ignorar */
      }
    }

    if (raw) {
      const h = hashRefresh(raw);
      await prisma.refreshSession.deleteMany({ where: { tokenHash: h } });
    }

    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function prepare(req, res) {
  ensureCsrfCookie(req, res);
  res.json({ ok: true });
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, refresh, logout, prepare, me };
