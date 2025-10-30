import type { User } from "./types/common";
import {
  type JointFlagKeys,
  JointFlags,
} from "@remoteadminplus/shared/common/user";

export const hasPerm = async (
  user: User,
  permissionsRequired?:
    | JointFlagKeys
    | JointFlagKeys[]
    | ((user: User) => Promise<boolean>),
) => {
  // eslint can fuck off, this is how you're supposed to do it
  // eslint-disable-next-line no-extra-boolean-cast
  if (!!(user.flags & JointFlags.SUPERADMIN)) {
    return true;
  }

  switch (typeof permissionsRequired) {
    case "string": {
      const mask = JointFlags[permissionsRequired];
      if (
        (user.group !== null && !!(user.group?.permissions & mask)) ||
        !!(user.flags & mask)
      )
        break;
      return false;
    }
    case "object": {
      if (!Array.isArray(permissionsRequired)) break; // Fail open for objects that aren't arrays, to stay in line with default case

      let finalMask = 0n;
      for (const perm of permissionsRequired) {
        const mask = JointFlags[perm];
        finalMask |= mask;
      }

      if (
        (user.group !== null && !!(user.group?.permissions & finalMask)) ||
        !!(user.flags & finalMask)
      )
        break;
      return false;
    }
    case "function": {
      if (await permissionsRequired(user)) break;
      return false;
    }
    case "bigint": {
      // Flag names preferred!
      if (
        (user.group !== null &&
          !!(user.group?.permissions & permissionsRequired)) ||
        !!(user.flags & permissionsRequired)
      )
        break;
      return false;
    }
    default: {
      break; // Fail open for any other type
    }
  }

  return true;
};
