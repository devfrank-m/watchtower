import { auth } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, unauthorized, forbidden, successResponse, serverError } from "@/lib/api-helpers";
import * as argon2 from "argon2";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  if (!requireAdmin(session)) return forbidden();

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const serializedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt.toISOString(),
    }));

    return successResponse({ users: serializedUsers });
  } catch (error) {
    return serverError();
  }
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  if (!requireAdmin(session)) return forbidden();

  try {
    const { name, email, password, role } = await req.json();

    const missing = [email, password].filter((field) => !field);
    if (missing.length > 0) {
      return successResponse({ error: "Email and password are required" }, 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return successResponse({ error: "User with this email already exists" }, 400);
    }

    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        name: name || email,
        email,
        password: hashedPassword,
        role: role || "user",
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const serializedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt.toISOString(),
    };

    return successResponse({ user: serializedUser }, 201);
  } catch (error) {
    return serverError();
  }
}
