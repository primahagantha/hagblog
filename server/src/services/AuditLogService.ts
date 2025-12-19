import { eq, desc, count, and, sql, gte, lte } from "drizzle-orm";
import { db } from "../db";
import { auditLog, user } from "../db/schema";
import type { AuditLog, NewAuditLog, AuditAction, AuditEntity, AuditDetails } from "../db/schema";

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateAuditLogData {
  userId?: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details?: AuditDetails;
  ipAddress?: string;
}

export class AuditLogService {
  /**
   * Create a new audit log entry
   */
  async createLog(data: CreateAuditLogData): Promise<AuditLog> {
    const [newLog] = await db
      .insert(auditLog)
      .values({
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details,
        ipAddress: data.ipAddress,
      })
      .returning();

    return newLog;
  }

  /**
   * Get all logs with filters and pagination
   */
  async findAll(filters: AuditLogFilters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(auditLog.userId, filters.userId));
    }
    if (filters.action) {
      conditions.push(eq(auditLog.action, filters.action));
    }
    if (filters.entity) {
      conditions.push(eq(auditLog.entity, filters.entity));
    }
    if (filters.entityId) {
      conditions.push(eq(auditLog.entityId, filters.entityId));
    }
    if (filters.startDate) {
      conditions.push(gte(auditLog.createdAt, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(auditLog.createdAt, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [logs, totalResult] = await Promise.all([
      db
        .select({
          id: auditLog.id,
          userId: auditLog.userId,
          action: auditLog.action,
          entity: auditLog.entity,
          entityId: auditLog.entityId,
          details: auditLog.details,
          ipAddress: auditLog.ipAddress,
          createdAt: auditLog.createdAt,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        })
        .from(auditLog)
        .leftJoin(user, eq(auditLog.userId, user.id))
        .where(whereClause)
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(auditLog)
        .where(whereClause),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.count || 0,
        totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
      },
    };
  }

  /**
   * Get a single log by ID
   */
  async findById(id: string): Promise<AuditLog | null> {
    const [result] = await db
      .select({
        id: auditLog.id,
        userId: auditLog.userId,
        action: auditLog.action,
        entity: auditLog.entity,
        entityId: auditLog.entityId,
        details: auditLog.details,
        ipAddress: auditLog.ipAddress,
        createdAt: auditLog.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(auditLog)
      .leftJoin(user, eq(auditLog.userId, user.id))
      .where(eq(auditLog.id, id))
      .limit(1);

    return result || null;
  }

  /**
   * Get logs for a specific entity
   */
  async findByEntity(entity: string, entityId: string, page = 1, limit = 20) {
    return this.findAll({ entity: entity as AuditEntity, entityId }, page, limit);
  }

  /**
   * Get logs by user
   */
  async findByUser(userId: string, page = 1, limit = 20) {
    return this.findAll({ userId }, page, limit);
  }

  /**
   * Get action statistics
   */
  async getStats() {
    const [byAction, byEntity, recentCount] = await Promise.all([
      // Count by action
      db
        .select({
          action: auditLog.action,
          count: count(),
        })
        .from(auditLog)
        .groupBy(auditLog.action),
      // Count by entity
      db
        .select({
          entity: auditLog.entity,
          count: count(),
        })
        .from(auditLog)
        .groupBy(auditLog.entity),
      // Recent count (last 24 hours)
      db
        .select({ count: count() })
        .from(auditLog)
        .where(gte(auditLog.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))),
    ]);

    return {
      byAction: byAction.reduce((acc, item) => {
        acc[item.action] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byEntity: byEntity.reduce((acc, item) => {
        acc[item.entity] = item.count;
        return acc;
      }, {} as Record<string, number>),
      recentCount: recentCount[0]?.count || 0,
    };
  }
}

export const auditLogService = new AuditLogService();
