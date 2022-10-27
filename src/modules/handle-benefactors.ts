import { Benefactor } from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import db from "src/db";
import { issues } from "src/db/models/issues";
import logger from "src/utils/logger-handler";

export async function handleBenefactors(
    benefactors: Benefactor[],
    issues: issues,
    method: "create" | "delete" | "both",
    eventName: string
  ) {
    if (!benefactors.length) return;
  
    const notOnDatabase = ({ amount }: Benefactor, key: number) => {
      return (
        !issues.benefactors.find(({ contractId }) => contractId === key) &&
        BigNumber(amount)?.gt(0)
      );
    };

    const onDatabase = ({ amount }: Benefactor) => BigNumber(amount).isEqualTo(0);

    const handleExecType = async (item: Benefactor, key: number, method: "create" | "delete" | "both") => {
        const benefactor = {
            amount: BigNumber(item?.amount).toFixed(),
            contractId: key,
            issueId: issues.id,
            address: item.benefactor,
          }
        const { contractId, issueId } = benefactor
        
        if(method === "both"){
            if(notOnDatabase(item, key)) await db.benefactors.create(benefactor)
            else if(onDatabase(item)) await db.benefactors.destroy({ where: { contractId, issueId } })
        }else if(method === "delete"){
            if(onDatabase(item)) await db.benefactors.destroy({ where: { contractId, issueId } })
        }else if(method === "create"){
            if(notOnDatabase(item, key)) await db.benefactors.create(benefactor)
        }
    }
  
    await Promise.all(
      benefactors.map(async (item, key) => {
        try {
            handleExecType(item, key, method)
        } catch (e) {
          logger.warn(`${eventName} Failed to ${method === "both" ? "create or delete" : method} reward benefactor in database`, e);
          return;
        }
      })
    );
  }