const bcrypt = require('bcrypt');
const crypto = require('crypto');
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
  COOKIE_CSRF,
  accessCookieOptions,
  refreshCookieOptions,
  csrfCookieOptions,
  clearCookieOptions,
} = require('../config/cookies');
const { ensureCsrfCookie, generateCsrfValue } = require('../middleware/csrf');
const { hashGateToken } = require('../utils/adminGate');
const { decrypt } = require('../utils/cryptoAtRest');
const { verifyTotpAntiReplay } = require('../utils/totpSecurity');
const { audit } = require('../utils/auditLog');

async function verifyTurnstileIfConfigured(token, remoteip) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  // Solo exigir widget Turnstile si TURNSTILE_ENFORCE=true (secret solo no alcanza)
  if (process.env.TURNSTILE_ENFORCE !== 'true') return true;
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
}

async function persistRefreshSession(userId, rawRefresh, req) {
  const tokenHash = hashRefresh(rawRefresh);
  const jti = newJti();
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await prisma.sesionRefresco.create({
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

async function resolveAdminGate(req, res) {
  const gateRaw = req.get('x-admin-gate') || '';
  if (!gateRaw) {
    await uniformLoginDelay(140);
    res.status(403).json({ message: 'Acceso no autorizado.' });
    return null;
  }

  const gate = await prisma.desafioAccesoAdmin.findUnique({
    where: { tokenHash: hashGateToken(gateRaw) },
  });

  const gateValid = gate && !gate.usedAt && gate.expiresAt > new Date();
  if (!gateValid) {
    await uniformLoginDelay(140);
    res.status(403).json({ message: 'Acceso no autorizado.' });
    return null;
  }

  return gate;
}

async function consumeAdminGate(gateId) {
  await prisma.desafioAccesoAdmin.update({
    where: { id: gateId },
    data: { usedAt: new Date() },
  });
}

async function login(req, res, next) {
  try {
    const gate = await resolveAdminGate(req, res);
    if (!gate) return;

    const body = req.validatedBody || req.body;
    const turnstileOk = await verifyTurnstileIfConfigured(body.turnstileToken, req.ip);
    if (!turnstileOk) {
      await uniformLoginDelay(120);
      audit(req, 'auth.login.failed', { reason: 'turnstile' });
      return res.status(400).json({ message: 'Verificaciùn anti-bot fallida.' });
    }

    const { email, password, totpCode } = body;

    const userFull = await prisma.usuario.findUnique({ where: { email: email.trim() } });
    const hash = userFull?.password || '$2b$10$invalidinvalidinvalidinvalidinv';
    const ok = await bcrypt.compare(password, hash);

    if (!userFull || !ok) {
      await uniformLoginDelay(140);
      audit(req, 'auth.login.failed', { email: email?.slice(0, 100) });
      return res.status(401).json({ message: 'Credenciales invùlidas' });
    }

    if (userFull.totpEnabled) {
      if (!userFull.totpSecret) {
        return res.status(500).json({ message: 'MFA mal configurado' });
      }
      if (!totpCode) {
        await uniformLoginDelay(120);
        return res.status(401).json({
          message: 'Credenciales invùlidas',
          code: 'MFA_REQUIRED',
        });
      }

      let rawSecret;
      try {
        rawSecret = decrypt(userFull.totpSecret);
      } catch {
        await uniformLoginDelay(120);
        audit(req, 'auth.login.failed', { userId: userFull.id, reason: 'totp_decrypt' });
        return res.status(401).json({ message: 'Credenciales invùlidas' });
      }

      const totpResult = verifySync({
        token: totpCode,
        secret: rawSecret,
        window: 1,
      });
      if (!totpResult.valid) {
        await uniformLoginDelay(120);
        audit(req, 'auth.login.failed', { userId: userFull.id, reason: 'totp_invalid' });
        return res.status(401).json({ message: 'Credenciales invùlidas' });
      }

      const notReplay = await verifyTotpAntiReplay(userFull.id, totpCode);
      if (!notReplay) {
        await uniformLoginDelay(120);
        audit(req, 'auth.login.failed', { userId: userFull.id, reason: 'totp_replay' });
        return res.status(401).json({ message: 'Credenciales invùlidas' });
      }
    }

    const accessJti = newJti();
    const accessToken = signAccessToken(userFull, accessJti);
    const rawRefresh = randomRefreshRaw();
    await consumeAdminGate(gate.id);
    await persistRefreshSession(userFull.id, rawRefresh, req);

    ensureCsrfCookie(req, res);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, rawRefresh);

    await prisma.jtiAccesoRevocado.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    audit(req, 'auth.login.success', { userId: userFull.id, role: userFull.role });

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
    let rawNew;
    let user;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const session = await tx.sesionRefresco.findFirst({
          where: {
            tokenHash: h,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
          include: {
            usuario: true,
          },
        });

        if (!session) {
          const reused = await tx.sesionRefresco.findFirst({
            where: { tokenHash: h },
          });
          if (reused?.revokedAt) {
            await tx.sesionRefresco.deleteMany({ where: { userId: reused.userId } });
            await tx.usuario.update({
              where: { id: reused.userId },
              data: { tokenVersion: { increment: 1 } },
            });
          }
          const err = new Error('REUSE_DETECTED');
          err.status = 401;
          throw err;
        }

        await tx.sesionRefresco.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });

        const nextRaw = randomRefreshRaw();
        const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
        await tx.sesionRefresco.create({
          data: {
            userId: session.userId,
            tokenHash: hashRefresh(nextRaw),
            jti: newJti(),
            expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
            ip: req.ip || null,
            userAgent: req.get('user-agent')?.slice(0, 512) || null,
          },
        });

        return { rawNew: nextRaw, user: session.usuario };
      });

      rawNew = result.rawNew;
      user = result.user;
    } catch (err) {
      if (err.message === 'REUSE_DETECTED') {
        clearAuthCookies(res);
        audit(req, 'auth.refresh.reuse_detected');
        return res.status(401).json({
          message: 'Sesiùn invùlida. Iniciù sesiùn nuevamente.',
        });
      }
      throw err;
    }

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
          await prisma.jtiAccesoRevocado.upsert({
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
      await prisma.sesionRefresco.deleteMany({ where: { tokenHash: h } });
    }

    clearAuthCookies(res);
    res.cookie(COOKIE_CSRF, generateCsrfValue(), csrfCookieOptions());

    audit(req, 'auth.logout', { userId: req.user?.id ?? null });

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
