/**
 * Role-Based Access Control Helper
 * Barcha services uchun role-based filtering utility
 */

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role, User } from '@prisma/client';

export class RoleAccessHelper {
    /**
     * Market access tekshirish
     * - SUPERADMIN: barcha markets
     * - OWNER: o'z markets
     * - ADMIN/MANAGER/SELLER: o'z market
     */
    static validateMarketAccess(
        marketId: string,
        currentUser: User,
        ownerIdToCheck?: string,
    ): void {
        if ((currentUser.role as any) === 'SUPERADMIN') {
            return; // SUPERADMIN barcha marketlarga ruxsati bor
        }

        if (currentUser.role === Role.OWNER) {
            if (ownerIdToCheck && ownerIdToCheck !== currentUser.id) {
                throw new ForbiddenException("Bu marketga ruxsat yo'q");
            }
            return;
        }

        // ADMIN, MANAGER, SELLER
        if (currentUser.marketId !== marketId) {
            throw new ForbiddenException("Bu marketga ruxsat yo'q");
        }
    }

    /**
     * Data-ni role-based qilib filter qilish
     * SUPERADMIN: where {} (barcha data)
     * Boshqalar: where { marketId: currentUser.marketId }
     */
    static buildMarketFilter(currentUser: User): { marketId?: string } {
        if ((currentUser.role as any) === 'SUPERADMIN') {
            return {};
        }

        if (currentUser.role === Role.OWNER) {
            // OWNER-lar market ID bilan filter qilmaydi,
            // chunki ular ownerIds bilan filter qilinadi
            return {};
        }

        // ADMIN, MANAGER, SELLER
        if (!currentUser.marketId) {
            throw new ForbiddenException('Market tayinlanmagan');
        }

        return { marketId: currentUser.marketId };
    }

    /**
     * Operation huquqini tekshirish
     * Ki qilish mumkinligi (READ, CREATE, UPDATE, DELETE)
     */
    static canRead(currentUser: User): boolean {
        return [
            Role.SUPERADMIN,
            Role.OWNER,
            Role.ADMIN,
            Role.MANAGER,
            Role.SELLER,
        ].includes(currentUser.role);
    }

    static canCreate(currentUser: User): boolean {
        return ([Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER] as any[]).includes(
            currentUser.role,
        );
    }

    static canUpdate(currentUser: User): boolean {
        return ([Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER] as any[]).includes(
            currentUser.role,
        );
    }

    static canDelete(currentUser: User): boolean {
        return ([Role.SUPERADMIN, Role.OWNER, Role.ADMIN] as any[]).includes(
            currentUser.role,
        );
    }

    static canApprove(currentUser: User): boolean {
        return ([Role.SUPERADMIN, Role.OWNER, Role.ADMIN] as any[]).includes(
            currentUser.role,
        );
    }

    /**
     * Access tekshirish
     * @param minRole - minimum required role (higher rank = more permissions)
     */
    static validateRole(currentUser: User, minRole: Role): void {
        const roleRank = this.getRoleRank(currentUser.role);
        const minRank = this.getRoleRank(minRole);

        if (roleRank < minRank) {
            throw new ForbiddenException("Ruxsat yo'q");
        }
    }

    /**
     * Role ranking (higher number = more powerful)
     */
    private static getRoleRank(role: Role | string): number {
        const ranks: { [key: string]: number } = {
            SELLER: 1,
            MANAGER: 2,
            ADMIN: 3,
            OWNER: 4,
            SUPERADMIN: 5,
        };
        return ranks[role as string] || 0;
    }
}

/**
 * Usage Examples:
 *
 * // Market access validation
 * RoleAccessHelper.validateMarketAccess(marketId, currentUser);
 *
 * // Build filter for query
 * const filter = RoleAccessHelper.buildMarketFilter(currentUser);
 * const data = await prisma.data.findMany({
 *   where: { ...filter, ... },
 * });
 *
 * // Check permissions
 * if (!RoleAccessHelper.canDelete(currentUser)) {
 *   throw new ForbiddenException("O'chira olmaysiz");
 * }
 */
