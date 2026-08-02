import { prisma } from "../prisma";
import { ProjectRole } from "@prisma/client";

/**
 * Enterprise RBAC Engine
 * Validates whether a user has the necessary permissions to perform an action on a project.
 */
export async function verifyProjectAccess(
    projectId: string,
    userId: string,
    requiredRole: ProjectRole = ProjectRole.VIEWER
): Promise<boolean> {
    
    // 1. Fetch Membership
    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    });

    if (!membership) {
        // Fallback to check if the user is the legacy owner of the project
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (project?.userId === userId) {
            return true;
        }
        return false;
    }

    // 2. Role Hierarchy Validation
    const roleHierarchy: Record<ProjectRole, number> = {
        OWNER: 4,
        ADMIN: 3,
        EDITOR: 2,
        VIEWER: 1
    };

    const userLevel = roleHierarchy[membership.role];
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
}
