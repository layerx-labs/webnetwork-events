import DAO from "src/services/dao-service";

interface MakeDAOProps {
  web3Host: string;
  networkAddress?: string;
  registryAddress?: string;
}

export async function makeDAO({ web3Host, networkAddress, registryAddress }: MakeDAOProps): Promise<DAO> {
  const dao = new DAO({
    web3Host,
    networkAddress,
    registryAddress
  });
  await dao.start();
  return dao;
}