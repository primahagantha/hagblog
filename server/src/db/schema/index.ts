// Auth tables (BetterAuth required)
export { user, session, account, verification } from "./auth";
export type { User, NewUser, Session, Account } from "./auth";

// Content tables
export { category } from "./categories";
export type { Category, NewCategory } from "./categories";

export { post, postRelations } from "./posts";
export type { Post, NewPost } from "./posts";

export { tag, postTag, tagRelations, postTagRelations } from "./tags";
export type { Tag, NewTag, PostTag } from "./tags";

export { comment, commentRelations } from "./comments";
export type { Comment, NewComment } from "./comments";

// Configuration tables
export { setting } from "./settings";
export type { Setting, NewSetting } from "./settings";

export { subscriber } from "./subscribers";
export type { Subscriber, NewSubscriber } from "./subscribers";

// Media tables
export { upload, uploadRelations } from "./uploads";
export type { Upload, NewUpload } from "./uploads";

// Audit tables
export { auditLog, auditLogRelations } from "./auditLogs";
export type { AuditLog, NewAuditLog, AuditAction, AuditEntity, AuditDetails } from "./auditLogs";

