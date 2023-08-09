async function getEvents(eventList, fromBlock, toBlock, web3, chainId, contract, schema) {
  // Parent event is probably a lock creation
  contract
    .getPastEvents(eventList[0].name, {
      fromBlock: fromBlock,
      toBlock: toBlock,
    })
    .then(async (events) => {
      for (let event of events) {
        await eventList[0].handler(event, web3, chainId, contract, schema);
      }
      // Loop through each event
      for (let i = 1; i < eventList.length; i++) {
        contract
          .getPastEvents(eventList[i].name, {
            fromBlock: fromBlock,
            toBlock: toBlock,
          })
          .then((events) => {
            for (let event of events) {
              eventList[i].handler(event, web3, chainId, contract, schema);
            }
          });
      }
    });
}

async function setListeners(eventList, web3, chainId, contract, schema) {
  for (let event of eventList) {
    contract.events[event.name]({}, function (err, e) {})
      .on("connected", function (subscriptionId) {
        console.log(`${schema.modelName} ${event.name} (${chainId}) listener activated - ID ${subscriptionId}`);
      })
      .on("data", function (e) {
        event.creator(e, web3, chainId, contract, schema);
      })
      .on("changed", function (e) {
        event.reverter(e, web3, chainId, contract, schema);
      })
      .on("error", function (err, receipt) {
        console.log(`${schema.modelName} ${event.name} (${chainId})\nError: ${err}\nReceipt: ${receipt}`);
      });
  }
}

module.exports = { setListeners, getEvents };
