export const findOnABI = (abi: any[], keys: string[] | string) =>
  abi[(Array.isArray(keys) ? `filter` : `find`)](({name, type}) =>
    Array.isArray(keys)
      ? keys.includes(name) && type === "event"
      : keys.search(name) > -1
  )