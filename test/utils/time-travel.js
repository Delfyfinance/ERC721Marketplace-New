const timeMachine = require('ether-time-traveler');

let snapShotId;
const takeSnapshot =  async (provider) => {snapShotId = await timeMachine.takeSnapshot(provider)};
const advanceTime = async(provider, timestamp)=> await timeMachine.advanceTimeAndBlock(provider, timestamp)
const revertTime = async (provider) => await timeMachine.revertToSnapshot(provider, snapShotId)

module.exports =  {
  takeSnapshot,
  advanceTime, 
  revertTime,
  
}