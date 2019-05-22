import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(JSON.parse(CampaignFactory.interface), '0x7a6cfAB1Bf5586022810d554C61197cD30ad2e3D');

export default instance;
