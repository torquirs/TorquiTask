import z from "zod";
import { PROJECT_COLORS, PROJECT_ICONS } from "../project-appearance";

import { isTokenColor } from "../token-colors";
import { ProjectVisibility, StatusCategory, TaskPriority } from "@/generated/prisma";

const projectName = z
  .string()
  .trim()
  .min(1, "Give the project a name")
  .max(120, "That name is too long");

const projectDescription = z
  .string()
  .trim()
  .max(2000, "That description is too long")
  .nullish();

const projectColor = z.enum(PROJECT_COLORS);
const projectIcon = z.enum(PROJECT_ICONS);

export const createProjectInput = z.object({
  name: projectName,
  description: projectDescription,
  color: projectColor.default("indigo"),
  icon: projectIcon.default("folder"),
  visibility: z.enum(ProjectVisibility).default(ProjectVisibility.OPEN),
});

export const updateProjectInput = z
  .object({
    projectId: z.string().min(1),
    name: projectName.optional(),
    description: projectDescription,
    color: projectColor.optional(),
    icon: projectIcon.optional(),
    visibility: z.enum(ProjectVisibility).optional(),
  })
  .refine(
    (input) =>
      Object.entries(input).some(
        ([field, value]) => field !== "projectId" && value !== undefined,
      ),
    { message: "Nothing to update" },
  );

export const setProjectArchivedInput = z.object({
  projectId: z.string().min(1),
  archived: z.boolean(),
});

export const taskFiltersInput = z.object({
  projectId: z.string().min(1).optional(),
  /** Column ids. Unbounded, so validated as ids and scoped by the service. */
  statusIds: z.array(z.string().min(1)).max(20).optional(),
  labelIds: z.array(z.string().min(1)).max(20).optional(),
  /** `null` asks for top-level tasks only; a string for one parent's children. */
  parentId: z.string().min(1).nullish(),
  priority: z.array(z.enum(TaskPriority)).max(4).optional(),
  /** `null` in the list means unassigned, which is a filter people do use. */
  assigneeIds: z.array(z.string().min(1).nullable()).max(50).optional(),
  query: z.string().trim().min(1).max(200).optional(),
  dueFrom: z.date().optional(),
  dueTo: z.date().optional(),
  includeArchived: z.boolean().optional(),
});

export const listTasksInput = taskFiltersInput.extend({
  sort: z
    .enum(["rank", "dueDate", "priority", "title", "createdAt"])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

const taskTitle = z
  .string()
  .trim()
  .min(1, "Give the task a title")
  .max(200, "That title is too long");

const taskDescription = z
  .string()
  .trim()
  .max(10_000, "That description is too long")
  .nullish();

export const createTaskInput = z.object({
  projectId: z.string().min(1),
  statusId: z.string().min(1),
  title: taskTitle,
  description: taskDescription,
  parentId: z.string().min(1).nullish(),
  priority: z.enum(TaskPriority).optional(),
  startDate: z.date().nullish(),
  dueDate: z.date().nullish(),
  assigneeId: z.string().min(1).nullish(),
});

const statusName = z
  .string()
  .trim()
  .min(1, "Give the column a name")
  .max(40, "That name is too long for a column header");

/**
 * A palette key, not a colour. An unbounded string here would let a row decide
 * what the board renders — see src/lib/token-colors.ts.
 */
const statusColor = z.string().refine(isTokenColor, "Unknown colour");

export const createStatusInput = z.object({
  name: statusName,
  color: statusColor,
  category: z.enum(StatusCategory),
});

export const updateStatusInput = z
  .object({
    statusId: z.string().min(1),
    name: statusName.optional(),
    color: statusColor.optional(),
    category: z.enum(StatusCategory).optional(),
  })
  .refine(
    (input) =>
      input.name !== undefined ||
      input.color !== undefined ||
      input.category !== undefined,
    { message: "Nothing to update" },
  );

export const reorderStatusesInput = z.object({
  /** Every column on the board, in the order it should now appear. */
  statusIds: z.array(z.string().min(1)).min(1).max(20),
});