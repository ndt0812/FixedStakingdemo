import { useState, React } from "react";
import erc20abi from "./ERC20abi.json";
import Web3 from "web3";
import erc20abiToken from "./ERC20apiToken.json"

const bnbTestnetChainId = 97;

function App() {
  let { ethereum } = window;
  let web3 = new Web3(window.ethereum);
  let [account, setAccount] = useState("");
  let [connectButton, setConnectButton] = useState("Connect To Metamask");

  const tokenAddress = "0x73aC1b0dfb7d0227A4D02a1cC450c7bd9729eFDD";
  const fixedStakingAddress = "0x3f021974cbe41795c785Ce0F628c492865764202";
  const contractToken = new web3.eth.Contract(erc20abiToken, tokenAddress);
  const contractFixedStaking = new web3.eth.Contract(erc20abi, fixedStakingAddress);

  const [contractInfo, setContractInfo] = useState({
    addressContract: "-",
    tokenName: "-",
    tokenSymbol: "-",
    totalSupply: "-"
  });
  const [balanceInfo, setBalanceInfo] = useState({
    balance: "-"
  });
  const [staked, setStaked] = useState({
    staked: "-"
  });
  const [rewards, setRewards] = useState({
    rewards: "-"
  })
  const [duration, setDuration] = useState({
    duration: "-"
  })
  const [totalFined, setTotalFined] = useState({
    totalFined: "-"
  })

  let myInterval;

  function msToTime(ms) {
    let seconds = (ms / 1000).toFixed();
    if (seconds) return seconds;
  }

  function minToSec(min) {
    let seconds = (min * 60).toFixed();
    if (seconds) return seconds;
  }

  const connectMetamask = async (e) => {
    e.preventDefault();
    if (ethereum) {
      try {
        switchNetwork(bnbTestnetChainId);
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
          params: [{ eth_accounts: {} }]
        });
        setAccount(accounts[0]);

        var accountString = "";
        var leng = accounts[0].length;
        accountString = accounts[0].substring(0, 7) + '...' + accounts[0].substring(leng - 7, leng);
        setConnectButton(accountString);

        //getbalance
        const balance = await contractToken.methods.balanceOf(accounts[0]).call();
        const balanceWei = web3.utils.fromWei(balance, "ether");
        setBalanceInfo({
          balance: numberFormat(balanceWei, 2)
        });
        //getStake
        const staked = await contractFixedStaking.methods.staked(accounts[0]).call();
        const stakedWei = web3.utils.fromWei(staked, "ether");
        setStaked({
          staked: numberFormat(stakedWei, 2)
        })

        //tokenBeingHold
        const totalFined = await contractFixedStaking.methods.tokenBeingHold(accounts[0]).call();
        const totalFinedWei = web3.utils.fromWei(totalFined, "ether");
        setTotalFined({
          totalFined: numberFormat(totalFinedWei, 2)
        })
        if (numberFormat(stakedWei, 2) > "0.00") {
          const Rewards = await contractFixedStaking.methods.rewards(accounts[0]).call();
          const rewardsPerSecond = await contractFixedStaking.methods.earnedPerSecond(accounts[0]).call();
          myInterval = setInterval(getMyRewards, 2500);
          if (Rewards > 0 && rewardsPerSecond < Rewards) {
            return myInterval;
          } else {
            clearInterval(myInterval);
            console.log(rewardsPerSecond)
          }
        } else {
          return;
        }
      } catch (error) {
        console.log(error);
        return;
      }
    }
  }

  const contractInform = async () => {
    try {
      //contractInfo
      const tokenName = await contractToken.methods.name().call();
      const tokenSymbol = await contractToken.methods.symbol().call();
      const totalSupply = await contractToken.methods.totalSupply().call();
      const totalSupplyWei = web3.utils.fromWei(totalSupply, "ether");
      setContractInfo({
        addressContract: tokenAddress,
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        totalSupply: numberFormat(totalSupplyWei, 2)
      });

      const duration = await contractFixedStaking.methods.duration().call();
      if (duration === 600n) {
        const tenMins = "10 Mins";
        setDuration({
          duration: String(tenMins)
        })
      } if (duration === 31540000n) {
        const twelveMonths = "12 Months";
        setDuration({
          duration: String(twelveMonths)
        })
      } if (duration === 15552000n) {
        const sixMonths = "6 Months";
        setDuration({
          duration: String(sixMonths)
        })
      }
    } catch (error) {
      console.log(error);
      return;
    }

  }

  const disconnectMetamask = async () => {
    if (account) {
      const accounts = "";
      setAccount(accounts);
      window.location.reload(false);
    }
  }

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
      return;
    }
  }

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

  const getMyRewards = async () => {
    try {
      const contract = new web3.eth.Contract(erc20abi, fixedStakingAddress);
      const rewardsPerSecond = await contract.methods.earnedPerSecond(account).call();
      const rewardsWei = web3.utils.fromWei(rewardsPerSecond, "ether");

      setRewards({
        rewards: numberFormat(rewardsWei, 2)
      })
    } catch (error) {
      // console.log(error)
      return;
    }
  }

  const handleApprove = async (e) => {
    e.preventDefault();
    if (account) {
      try {
        const data = new FormData(e.target);
        const amountWei = web3.utils.toWei(data.get("amount"), "ether");
        console.log(amountWei)

        if (data.get("amount") > 0) {
          await contractToken.methods.approve(fixedStakingAddress, amountWei).send({ from: account });
        } else {
          alert("You must input amount to approve");
        }
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      return alert("Please connect to Metamask")
    }

  };

  const handleStake = async (e) => {
    e.preventDefault();
    if (account) {
      try {
        const data = new FormData(e.target);

        const duration = await contractFixedStaking.methods.duration(account).call();
        const amountWei = web3.utils.toWei(data.get("amount"), "ether");
        const balance = await contractToken.methods.balanceOf(account).call();
        const allowance = await contractToken.methods.allowance(account, fixedStakingAddress).call();

        console.log(allowance)
        console.log(amountWei)

        if (allowance > 0) {
          if (allowance >= amountWei) {
            if (data.get("amount") > 0) {
              if (balance >= amountWei) {
                if (duration > 0) {
                  if (staked.staked === "0.00") {
                    if (totalFined.totalFined === "0.00") {
                      await contractFixedStaking.methods.stake(amountWei).send({ from: account });
                      window.location.reload(false);
                    } else {
                      alert("Your token is on hold")
                    }
                  } else {
                    alert("The staking is not finish or you have not withdraw")
                  }
                } else {
                  alert("Duration has not been fixed yet")
                }
              } else {
                alert("Not enough balance")
                return
              }
            } else {
              alert("You must input token to staking")
            }
          } else {
            alert("allowance not enought")
          }
        } else {
          alert("Please approve amount token you want to stake")
        }


      } catch (error) {
        console.log(error);
        return;
      }

    } else {
      return alert("Please connect to Metamask")
    }

  };

  const handleUnStake = async (e) => {
    e.preventDefault();
    if (account) {
      try {
        if (staked.staked > "0.00") {
          await contractFixedStaking.methods.withdrawn().send({ from: account });
          window.location.reload(false);
        } else {
          return alert("Nothing to claim");
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      return alert("Please connect to Metamask")
    }
  };

  const handleUnstakeTokenHold = async (e) => {
    e.preventDefault();
    try {
      if (account) {
        const withdrawTs = await contractFixedStaking.methods.withdrawnFromTs(account).call();
        console.log(Number(minToSec(5)));
        console.log(Number(withdrawTs));
        console.log(msToTime(Date.now()));

        if (staked.staked === "0.00") {
          if (totalFined.totalFined > "0.00") {
            if ((Number(minToSec(5)) + Number(withdrawTs)) < msToTime(Date.now())) {
              await contractFixedStaking.methods.afterOneDay(account).send({ from: account });
              window.location.reload(false);
            } else {
              alert("Your token is held for 1 day");
            }
          } else {
            alert("Your tokens are not held")
          }
        } else {
          alert("The staking time is not over yet")
        }
      } else {
        alert("Please connect to Metamask")
      }
    } catch (error) {
      console.log(error)
      return;
    }
  }


  return (
    <body onload={contractInform()}>
      <div className="App">
        <div id="connectMeta">
          <div>
            <button class="button-55" onClick={connectMetamask}>{connectButton}</button>
          </div>
          <div>
            <button class="button-55" onClick={disconnectMetamask}>Log out</button>
          </div>
        </div>

        <div>
          <h2>FIXED STAKING</h2>
        </div>

        <div id="main">
          <div>
            <div id="contractInfo">
              <table>
                <thead>
                  <tr>
                    <th>Name Token</th>
                    <th>Symbol</th>
                    <th>Total supply</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th >{contractInfo.tokenName}</th>
                    <td >{contractInfo.tokenSymbol}</td>
                    <td >{contractInfo.totalSupply}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div id="bsrInfo">
              <div>Balance : </div>
              <p >{balanceInfo.balance}</p>
            </div>

            <div id="bsrInfo">
              <div>Staked : </div>
              <p >{staked.staked}</p>

            </div>

            <div id="bsrInfo">
              <div> Rewards : </div>
              <p>{rewards.rewards}</p>
            </div>
          </div>

          <div id="front-bot">
            <p>{duration.duration} term</p>
            <div>
              <form onSubmit={handleApprove} id="approve-this">
                <input
                  type="text"
                  name="amount"
                  placeholder="Amount to approve"
                  id="amountStake"
                />
                <button type="submit" class="button-40">
                  Approve
                </button>
              </form>
              <form onSubmit={handleStake}>
                <input
                  type="text"
                  name="amount"
                  placeholder="Amount to stake"
                  id="amountStake"
                />
                <button type="submit" class="button-40" >
                  Stake
                </button>
              </form>

              <button
                type="submit"
                data-toggle="modal" data-target="#exampleModalCenter"
                class="button-40"
              >
                Claim
              </button>
            </div>

            <div>
              <p>Holding : {totalFined.totalFined}</p>
              <button
                type="submit"
                onClick={handleUnstakeTokenHold}
              >
                Withdraw
              </button>
            </div>

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
                    If you claim before the end time, your request will go to a 5 minute cooldown.
                    You will be subject to an early withdrawal fee of (1%) and will not be able to bet back on this pool until the cooldown is over
                  </div>
                  <div className="modal-footer" >
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={handleUnStake}>Continue</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </body>


  );
}

export default App;
