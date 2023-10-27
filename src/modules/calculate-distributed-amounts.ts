import { Defaults, ProposalDetail } from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import { issues } from "src/db/models/issues";
import { DistributedAmounts } from "src/interfaces/bounties";
import { makeDAO } from "src/utils/dao";

const bigNumberPercentage = 
  (value1: BigNumber, value2: BigNumber) => value1.dividedBy(value2).multipliedBy(100).toFixed(2);


export default function calculateDistributedAmounts(closeFee: string | number,
                                                    mergerFee: string | number,
                                                    proposerFee: string | number,
                                                    bountyAmount: string | number,
                                                    proposalPercents: ProposalDetail[]): DistributedAmounts {
  const bnBountyAmount = BigNumber(bountyAmount);
  const treasuryAmount = bnBountyAmount.dividedBy(100).multipliedBy(closeFee);
  const realAmount = bnBountyAmount.minus(treasuryAmount);

  const mergerAmount =  realAmount.dividedBy(100).multipliedBy(mergerFee);
  const proposerAmount = realAmount.minus(mergerAmount).dividedBy(100).multipliedBy(proposerFee);
  const amount = realAmount.minus(mergerAmount).minus(proposerAmount);

  return {
    treasuryAmount: {
      value: treasuryAmount.toFixed(),
      percentage: bigNumberPercentage(treasuryAmount, bnBountyAmount),
    },
    mergerAmount: {
      value: mergerAmount.toFixed(),
      percentage: bigNumberPercentage(mergerAmount, bnBountyAmount),
    },
    proposerAmount: {
      value: proposerAmount.toFixed(),
      percentage: bigNumberPercentage(proposerAmount, bnBountyAmount),
    },
    proposals: proposalPercents.map(({percentage, recipient}) => {
      const value = amount.dividedBy(100).multipliedBy(percentage);
      return {
        value: value.toFixed(),
        recipient,
        percentage: bigNumberPercentage(value, bnBountyAmount),
      }
    }),
  };
}

export async function getDeveloperAmount(bounty: issues, web3Host: string): Promise<string> {
  const dao = await makeDAO({
    web3Host,
    networkAddress: bounty.network.networkAddress
  });
  const closeFee = await dao.getCloseFee();
  const distributedAmounts = calculateDistributedAmounts( closeFee,
                                                          bounty.network.mergeCreatorFeeShare!, 
                                                          bounty.network.proposerFeeShare!, 
                                                          bounty.amount!, 
                                                          [{recipient: "0x00", percentage: 100}]);
  return distributedAmounts?.proposals?.at(0)?.value || "0";
}