export const findOnABI = (abi: any[], keys: string[] | string) =>
  abi[(Array.isArray(keys) ? `filter` : `find`)](({name, type}) =>
    type === "event" && (Array.isArray(keys)
      ? keys.includes(name)
      : keys.search(name) > -1)
  )