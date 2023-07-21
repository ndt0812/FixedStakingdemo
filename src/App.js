import { useState, useEffect, React } from "react";
import erc20abi from "./ERC20abi.json";
import Web3 from "web3";
const ethers = require("ethers");

const bnbTestnetChainId = 97;

function App() {
  let { ethereum } = window;
  let web3 = new Web3(window.ethereum);
  let [account, setAccount] = useState("");
  const [contractListened, setContractListened] = useState("");
  const [contractInfo, setContractInfo] = useState({
    address: "-",
    tokenName: "-",
    tokenSymbol: "-",
    totalSupply: "-"
  });
  const [balanceInfo, setBalanceInfo] = useState({
    address: "-",
    balance: "-"
  });
  const [staked, setStaked] = useState({
    address: "-",
    staked: "-"
  });

  const [rewards, setRewards] = useState({
    address: "-",
    rewards: "-"
  })

  const connectMetamask = async () => {
    if (ethereum) {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      await switchNetwork(bnbTestnetChainId);
      console.log(accounts)
    }
  }

  // const disconnectMetamask = async () => {
  //   if (ethereum) {
  //     await window.ethereum.request({
  //       method: "wallet_requestPermissions",
  //       params: [{
  //         eth_accounts: {}
  //       }]
  //     }).then(() => ethereum.request({
  //       method: 'eth_requestAccounts'
  //     }))
  //   }
  // }

  const switchNetwork = async (chainId) => {
    const currenChainId = await web3.eth.getChainId();
    if (currenChainId !== chainId) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: Web3.utils.toHex(chainId) }]
        });
      } catch (error) {
        console.log(`error occured while switching chain to chainId : ${chainId}, err : ${error.message}, code: ${error.code}`);
        if (error.code === 4902) {
          addNetwork(tbnbNetwork);
        }
      }
    }
  }

  const tbnbNetwork = {
    chainId: Web3.utils.toHex(bnbTestnetChainId),
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: {
      name: "TestNetBNB",
      symbol: "tBNB",
      decimals: 18
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.bnbchain.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"]
  }

  const addNetwork = async (networkDetails) => {
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          networkDetails
        ]
      });
    } catch (err) {
      console.log(`error ocuured while adding new chain with chainId:${networkDetails.chainId}, err: ${err.message}`)
    }
  }

  useEffect(() => {
    if (contractInfo.address !== "-") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractInfo.address, erc20abi, provider);

      setContractListened(contract);
    }
  }, [contractInfo.address]);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const Address = "0x0F308ae5ba0F324B240F275917168a499F75b353";
      const contract = new web3.eth.Contract(erc20abi, Address);
      const tokenName = await contract.methods.name().call();
      const tokenSymbol = await contract.methods.symbol().call();
      const totalSupply = await contract.methods.totalSupply().call();
      const totalSupplyWei = web3.utils.fromWei(totalSupply, "ether");

      setContractInfo({
        address: Address,
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        totalSupply: numberFormat(totalSupplyWei, 4)
      });
    } catch (error) {
      return alert('Please switch network first, click "Connect To Metamask" to switch network BNB Testnet!');
    }
  };

  const numberFormat = (number, toFixed) => {
    number = Number(number).toFixed(toFixed) + '';
    var x = number.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }

  const getMyBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new web3.eth.Contract(erc20abi, contractInfo.address);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const balance = await contract.methods.balanceOf(signerAddress).call();
      const balanceWei = web3.utils.fromWei(balance, "ether");

      setBalanceInfo({
        address: signerAddress,
        balance: numberFormat(balanceWei, 4)
      });
    } catch (error) {
      console.log(error)
      return alert('Please click "Get Token info" first!')
    }

  };

  const getMyStaked = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const contract = new web3.eth.Contract(erc20abi, contractInfo.address);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const staked = await contract.methods.staked(signerAddress).call();
      const stakedWei = web3.utils.fromWei(staked, "ether");

      setStaked({
        address: signerAddress,
        staked: numberFormat(stakedWei, 4)
      })
    } catch (error) {
      console.log(error)
      return alert('Please click "Get Token info" first!')
    }
  }

  const getMyRewards = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const contract = new web3.eth.Contract(erc20abi, contractInfo.address);
      const Rewards = await contract.methods.rewards(signerAddress).call();
      const rewardsWei = web3.utils.fromWei(Rewards, "ether");

      setRewards({
        address: signerAddress,
        rewards: numberFormat(rewardsWei, 4)
      })
    } catch (error) {
      console.log(error)
      return alert("Please get contract info first")
    }
  }

  const handleDuration = async (e) => {
    try {
      e.preventDefault();
      const data = new FormData(e.target);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new web3.eth.Contract(erc20abi, contractInfo.address);
      await contract.methods.setDuration(data.get("_duration")).send({ from: signer.address });
    } catch (error) {
      console.log(error)
      //console.log(tenMins)
      return alert("Choose the duration you want")
    }
  }

  const handleStake = async (e) => {
    try {
      e.preventDefault();
      const data = new FormData(e.target);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new web3.eth.Contract(erc20abi, contractInfo.address);
      const duration = await contract.methods.duration(signer.address).call();
      const amountWei = web3.utils.toWei(data.get("amount"), "ether");

      if (duration === 0n) {
        return alert("Please set duration")
      } else {
        if (!data.get("amount")) {
          return alert('you must input token to staking')
        } else {
          await contract.methods.stake(amountWei).send({ from: signer.address });
        }
      }
    } catch (error) {
      console.log(error);
      return alert('Please click "Get Token info" first!')
    }

  };

  const handleUnStake = async (e) => {
    try {
      e.preventDefault();
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractInfo.address, erc20abi, signer);
      await contract.unstake();
    } catch (error) {
      return alert("nothing to withdraw");
    }
  };


  return (
    <div className="App">
      <div>
        <table>
          <tr>
            <th><button onClick={connectMetamask}>CONNECT TO METAMASK</button></th>
            <th><p>{account}</p></th>
          </tr>
          {/* <tr>
            <th><button onClick={disconnectMetamask}>DISCONNECT TO METAMASK</button></th>
          </tr> */}
        </table>
      </div>

      <div>
        <div className="credit-card w-full lg:w-3/4 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
          <main className="mt-4 p-4">
            <h1 className="text-xl font-semibold text-gray-700 text-center">
              Read from smart contract
            </h1>
            <div className="">
              <div className="my-3">
              </div>
            </div>
          </main>

          <footer className="p-4">
            <button
              type="submit"
              className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
              onClick={handleSubmit}
            >
              Get token info
            </button>
          </footer>
          <div className="px-4">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Total supply</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{contractInfo.tokenName}</th>
                    <td>{contractInfo.tokenSymbol}</td>
                    <td>{contractInfo.totalSupply}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={getMyBalance}
              type="submit"
              className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
            >
              Get your balance
            </button>
          </div>
          <div className="px-4">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{balanceInfo.address}</th>
                    <th>{balanceInfo.balance}</th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4">
            <button
              onClick={getMyStaked}
              type="submit"
              className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
            >
              Get your staked
            </button>
          </div>
          <div className="px-4">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Staked</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{staked.address}</th>
                    <th>{staked.staked}</th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={getMyRewards}
              type="submit"
              className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
            >
              Get your rewards
            </button>
          </div>
          <div className="px-4">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Rewards</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{rewards.address}</th>
                    <td>{rewards.rewards}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="m-4 credit-card w-full lg:w-3/4 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
          <div className="mt-4 p-4">
            <h1 className="text-xl font-semibold text-gray-700 text-center">
              Write to contract
            </h1>
            <form onSubmit={handleDuration}>
              <div className="my-3">
                <input type="radio" name="_duration" value="600" /> 10 Mins
                <input type="radio" name="_duration" value="15552000" /> 6 Months
                <input type="radio" name="_duration" value="31104000" /> 12 Months
              </div>
              <footer className="p-4">
                <button
                  type="submit"
                  className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                >
                  Set Duration
                </button>
              </footer>
            </form>

            <form onSubmit={handleStake}>
              <div className="my-3">
                <input
                  type="text"
                  name="amount"
                  className="input input-bordered block w-full focus:ring focus:outline-none"
                  placeholder="Amount to stake"
                />
              </div>
              <footer className="p-4">
                <button
                  type="submit"
                  className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                >
                  Stake
                </button>
              </footer>
            </form>

            <footer className="p-4">
              <button
                type="submit"
                className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                data-toggle="modal" data-target="#exampleModalCenter"
              >
                Withdraw
              </button>
              <div className="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
                aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLongTitle">Notification</h5>
                      <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      If you withdraw before the end time, you will not receive rewards and will be fined 1%.
                      Are you sure?
                    </div>
                    <div className="modal-footer" >
                      <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                      <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={handleUnStake}>Continue</button>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
