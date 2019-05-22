import Web3 from 'web3';

let web3;

if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    //in browser with metamask running
    web3 = new Web3(window.web3.currentProvider);
} else {
    //on server OR user is not running metamask
    const provider = new Web3.providers.HttpProvider(
        'https://rinkeby.infura.io/v3/e1c7f6ae17a047bf910c505558b71616'
    );
    web3 = new Web3(provider);
}
export default web3;