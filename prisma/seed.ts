import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('Admin123!', 10);

    await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {
            role: Role.SUPERADMIN,
            status: UserStatus.ACTIVE,
            password,
        },
        create: {
            email: 'admin@gmail.com',
            fullName: 'Super Admin',
            password,
            role: Role.SUPERADMIN,
            status: UserStatus.ACTIVE,
        },
    });

    console.log('SuperAdmin user seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
