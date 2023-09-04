export const dbBountyUrl = (dbBounty: any) =>
  `/${dbBounty.network.name}/${dbBounty.githubId}/${dbBounty.repository_id}`;

export const dbBountyDeliverableUrl = (dbBounty: any, prId) =>
  `/${dbBounty.network.name}/deliverable/${prId}`;

export const dbBountyProposalUrl = (dbBounty: any, proposal: any, proposalId: any) =>
  `/${dbBounty.network.name}/proposal?id=${dbBounty.githubId}&repoId=${dbBounty.repository_id}&proposalId=${proposalId}`