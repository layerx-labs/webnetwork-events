import {users} from "../db/models/users";
import db from "../db";

export async function getEventTargets(targets?: Pick<users, "email" | "id" | "user_settings">[]) {
  targets =
    (targets?.length
        ? targets.filter(u => u.user_settings?.[0].notifications)
        : (await db.users.findAll({
          include: [{association: "user_settings", where: {notifications: true}, required: true}],
          raw: true
        }))
    );

  const reduceTargetToRecipientIds = (p: {
    recipients: string[],
    ids: number[]
  }, c: Pick<users, "email" | "id" | "user_settings">) =>
    ({recipients: [...p.recipients, c.email], ids: [...p.ids, c.id]}) as { recipients: string[], ids: number[] };

  return targets.reduce(reduceTargetToRecipientIds, {recipients: [], ids: []});
}