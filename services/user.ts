import { prisma } from "@/lib/db";
import { Prisma, User, UserQualification } from "@prisma/client";

export class UserService {
  static async getUser(
    userId: string,
  ): Promise<(User & { qualifications: UserQualification[] }) | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { qualifications: true },
    });
  }

  static async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  static async deleteUser(userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Remove from email queue so they get no future emails
      await tx.postEmailQueue.deleteMany({ where: { userId } });

      // 2. Remove user
      await tx.user.delete({
        where: { id: userId },
      });

      // the rest is onCasecade or SetNull
    });
  }

  static async getUserQualifications(userId: string) {
    return await prisma.userQualification.findMany({
      where: { userId },
    });
  }

  static async getUserImage(id: string) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      select: { image: true },
    });
  }

  static async getUsersCount() {
    return await prisma.user.count({
      where: { isActive: true },
    });
  }
}
