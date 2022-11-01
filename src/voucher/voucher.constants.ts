// PaymentVoucher(address payee,uint256 nonce,uint256 amount)
export const VOUCHER_TYPE = {
  PaymentVoucher: [
    { name: 'payee', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'amount', type: 'uint256' },
  ],
};
