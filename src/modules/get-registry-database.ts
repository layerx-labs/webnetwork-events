import db from "src/db";

export async function getRegistryAddressDb(chainId: string) {
  return (await db.chains.findOne({ where: { chainId } }))?.registryAddress;
}