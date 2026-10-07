import { ApiError } from '@utils/ApiError.js';
import { toId } from '@utils/prisma.js';
import type { Actor } from '../types/index.js';

export const resolveStaffAttribution = (
    actor: Actor,
    actingAsStaffId?: string | number,
): number | undefined => {
    if (actor.type === 'staff') {
        if (
            actingAsStaffId !== undefined &&
            toId(actingAsStaffId, 'staff id') !== actor.id
        ) {
            throw new ApiError(403, 'Staff cannot act as another staff member');
        }
        return actor.id;
    }

    if (
        actingAsStaffId === undefined ||
        actingAsStaffId === null ||
        actingAsStaffId === ''
    ) {
        return undefined;
    }

    return toId(actingAsStaffId, 'acting as staff id');
};

/** Preserve the separate Admin audit columns used by existing write paths. */
export const adminAuditId = (actor: Actor): number | undefined =>
    actor.type === 'admin' ? actor.id : undefined;


export const adminCreatorId = (actor: Actor): number | undefined =>
    actor.type === 'admin' ? actor.id : undefined;