import { Event } from 'ethers';
import { RELEASED_EVENT } from './released-event.constants';
import { ReleasedEventInterface } from './released-event.interfaces';

export const formatReleasedEvent = (event: Event): ReleasedEventInterface => {
  return {
    payee: event.args[0],
    nonce: event.args[1].toString(),
    amount: event.args[2].toString(),
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash,
  };
};

export const getNextFileName = (prevFileName: string): string => {
  const postfix = prevFileName.split('-')[1];
  const [prevFileNumber, ext] = postfix.split('.');

  return `${RELEASED_EVENT}-${Number(prevFileNumber) + 1}.${ext}`;
};
