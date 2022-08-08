import DAOService from "src/services/dao-service";

async function bountyReadyPRsHasNoInvalidProposals(
  networkBounty: any,
  dao: DAOService
): Promise<number> {
  const readyPRsIds = networkBounty.pullRequests
    .filter((pr) => pr.ready)
    .map((pr) => pr.id);

  if (!readyPRsIds.length) return 0;

  const readyPRsWithoutProposals = readyPRsIds.filter(
    (pr) => !networkBounty.proposals.find((p) => p.prId === pr)
  );

  if (readyPRsWithoutProposals.length) return 3;

  const proposalsWithDisputeState = await Promise.all(
    networkBounty.proposals
      .filter((p) => readyPRsIds.includes(p.prId))
      .map(async (p) => ({
        ...p,
        isDisputed: await dao.network?.isProposalDisputed(
          networkBounty.id,
          p.id
        ),
      }))
  );

  const invalidProposals = proposalsWithDisputeState.filter(
    (p) => p.isDisputed || p.refusedByBountyOwner
  );

  if (
    invalidProposals.length &&
    proposalsWithDisputeState.length === invalidProposals.length
  )
    return 1;

  return 2;
}

export default async function validateProposalState(
  currentState: string,
  networkBounty: any,
  dao: DAOService
): Promise<string> {
  const validation = await bountyReadyPRsHasNoInvalidProposals(
    networkBounty,
    dao
  ).catch((error) => {
    console.error(error);
    return -1;
  });

  let newState = currentState;

  if ([0, 1].includes(validation)) newState = "open";
  if ([2, 3].includes(validation)) newState = "ready";

  return newState;
}
