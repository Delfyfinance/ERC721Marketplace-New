
const { BigNumber} = require("ethers")

const DELAY = ()=> (60 * 60 * 24 * 2)+20
const ADDRESS_ZERO = ()=>"0x0000000000000000000000000000000000000000";

const mineBlock = async(provider, timestamp)=>provider.send('evm_mine', [timestamp])

const expandTo18Decimals= (n)=> BigNumber.from(n).mul(BigNumber.from(10).pow(18))
const toHumanVal = (n)=>BigNumber.from(n).div(BigNumber.from(10).pow(18))
const addNumbers = (val, val1) => BigNumber.from(val).add(BigNumber.from(val1))
const subNumbers = (val, val1) => BigNumber.from(val).sub(BigNumber.from(val1))
const toBigNumber = (val) => BigNumber.from(val)

module.exports ={ mineBlock, expandTo18Decimals, addNumbers, subNumbers, toBigNumber,toHumanVal, DELAY, ADDRESS_ZERO }