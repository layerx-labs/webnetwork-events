export const NETWORK_BOUNTY_NOT_FOUND = (name, id, networkAddress) =>
  `${name} Bounty not found for id ${id} in network ${networkAddress}`;

export const DB_BOUNTY_NOT_FOUND = (name, cid, networkId) =>
  `${name} Failed to find a bounty in database matching ${cid} on network ${networkId}`

export const NETWORK_NOT_FOUND = (name, address) => `${name} Failed to find a network with ${address}`;
