import { useRouter } from 'next/router';
import React from 'react';
import { useAccount, useWalletClient, useNetwork, useSwitchNetwork } from 'wagmi';

import type { SmartContractWriteMethod } from 'types/api/contract';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import getQueryParamString from 'lib/router/getQueryParamString';
import ContractMethodsAccordion from 'ui/address/contract/ContractMethodsAccordion';
import ContentLoader from 'ui/shared/ContentLoader';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import ContractConnectWallet from './ContractConnectWallet';
import ContractCustomAbiAlert from './ContractCustomAbiAlert';
import ContractImplementationAddress from './ContractImplementationAddress';
import ContractWriteResult from './ContractWriteResult';
import ContractMethodForm from './methodForm/ContractMethodForm';
import useContractAbi from './useContractAbi';
import { getNativeCoinValue, prepareAbi } from './utils';

const ContractWrite = () => {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const router = useRouter();

  const tab = getQueryParamString(router.query.tab);
  const addressHash = getQueryParamString(router.query.hash);
  const isProxy = tab === 'write_proxy';
  const isCustomAbi = tab === 'write_custom_methods';

  const { data, isPending, isError } = useApiQuery(isProxy ? 'contract_methods_write_proxy' : 'contract_methods_write', {
    pathParams: { hash: addressHash },
    queryParams: {
      is_custom_abi: isCustomAbi ? 'true' : 'false',
    },
    queryOptions: {
      enabled: Boolean(addressHash),
      refetchOnMount: false,
    },
  });

  const contractAbi = useContractAbi({ addressHash, isProxy, isCustomAbi });

  const handleMethodFormSubmit = React.useCallback(async(item: SmartContractWriteMethod, args: Array<unknown>) => {
    if (!isConnected) {
      throw new Error('Wallet is not connected');
    }

    if (chain?.id && String(chain.id) !== config.chain.id) {
      await switchNetworkAsync?.(Number(config.chain.id));
    }

    if (!contractAbi) {
      throw new Error('Something went wrong. Try again later.');
    }

    if (item.type === 'receive' || item.type === 'fallback') {
      const value = getNativeCoinValue(args[0]);
      const hash = await walletClient?.sendTransaction({
        to: addressHash as `0x${ string }` | undefined,
        value,
      });
      return { hash };
    }

    const _args = 'stateMutability' in item && item.stateMutability === 'payable' ? args.slice(0, -1) : args;
    const value = 'stateMutability' in item && item.stateMutability === 'payable' ? getNativeCoinValue(args[args.length - 1]) : undefined;
    const methodName = item.name;

    if (!methodName) {
      throw new Error('Method name is not defined');
    }

    const abi = prepareAbi(contractAbi, item);
    const hash = await walletClient?.writeContract({
      args: _args,
      abi,
      functionName: methodName,
      address: addressHash as `0x${ string }`,
      value: value as undefined,
    });

    return { hash };
  }, [ isConnected, chain, contractAbi, walletClient, addressHash, switchNetworkAsync ]);

  const renderItemContent = React.useCallback((item: SmartContractWriteMethod, index: number, id: number) => {
    return (
      <ContractMethodForm
        key={ id + '_' + index }
        data={ item }
        onSubmit={ handleMethodFormSubmit }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resultComponent={ ContractWriteResult as any }
        methodType="write"
      />
    );
  }, [ handleMethodFormSubmit ]);

  if (isError) {
    return <DataFetchAlert/>;
  }

  if (isPending) {
    return <ContentLoader/>;
  }

  if (data.length === 0 && !isProxy) {
    return <span>No public write functions were found for this contract.</span>;
  }

  return (
    <>
      { isCustomAbi && <ContractCustomAbiAlert/> }
      <ContractConnectWallet/>
      { isProxy && <ContractImplementationAddress hash={ addressHash }/> }
      <ContractMethodsAccordion data={ data } addressHash={ addressHash } renderItemContent={ renderItemContent } tab={ tab }/>
    </>
  );
};

export default React.memo(ContractWrite);
