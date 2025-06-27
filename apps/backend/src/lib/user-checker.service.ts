import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

export async function testUser(prisma: PrismaService, user: JwtPayload) {
  if (!user.id) {
    throw new NotFoundException('Test User : User ID not found in token');
  }

  const found = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!found) {
    throw new NotFoundException('Test User : User not found');
  }

  return found;
}
