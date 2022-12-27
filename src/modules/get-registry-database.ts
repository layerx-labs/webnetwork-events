import db from "src/db";

export async function getRegistryAddressDb() {
     return await db.settings.findOne({
        where: { visibility: "public", group: "contracts", key: "networkRegistry" },
        raw: true,
      }).then(setting => setting?.value) || null
}