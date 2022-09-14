export const NETWORK_BOUNTY_NOT_FOUND = (id, networkAddress) =>
  `Bounty not found for id ${id} in network ${networkAddress}`;

export const DB_BOUNTY_NOT_FOUND = (cid, networkId) =>
  `Failed to find a bounty in database matching ${cid} on network ${networkId}`

