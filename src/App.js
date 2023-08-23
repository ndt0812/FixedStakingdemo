import { useState, React } from "react";
import erc20abi from "./ERC20abi.json";
import Web3 from "web3";
import erc20abiToken from "./ERC20apiToken.json"
import { ethers } from "ethers";

const bnbTestnetChainId = 97;

function App() {
  let { ethereum } = window;
  let web3 = new Web3(window.ethereum);
  let [account, setAccount] = useState("");
  let [connectButton, setConnectButton] = useState("Connect To Metamask");
  const timeStamp = new Date();

  let term = [180, 600, 1200];

  const tokenAddress = "0x40195D7F7aCcD636B4e8000a64E31e295d954b41";
  const fixedStakingAddress = "0xA3f7A7A42F42a5749E388DEA562d9ecBa8095393";
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
    stakedTermOne: "-",
    stakedTermTwo: "-",
    stakedTermThree: "-"
  });
  const [rewards, setRewards] = useState({
    rewardsOne: "-",
    rewardsTwo: "-",
    rewardsThree: "-"
  })
  const [duration, setDuration] = useState({
    durationOne: "-",
    durationTwo: "-",
    durationThree: "-",
  })
  const [interestRate, setInterestRate] = useState({
    interestRateOne: "-",
    interestRateTwo: "-",
    interestRateThree: "-",
  })
  const [totalFined, setTotalFined] = useState({
    totalFined1: "-",
    totalFined2: "-",
    totalFined3: "-",
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

  function secToMin(sec) {
    let mins = (sec / 60).toFixed();
    if (mins) return mins;
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
        let promise1 = new Promise(async function (resolve) {
          const stakedOne = await contractFixedStaking.methods.staked(accounts[0], term[0]).call();
          const stakedWeiOne = web3.utils.fromWei(stakedOne, "ether");
          resolve(stakedWeiOne);
        })

        let promise2 = new Promise(async function (resolve) {
          const stakedTwo = await contractFixedStaking.methods.staked(accounts[0], term[1]).call();
          const stakedWeiTwo = web3.utils.fromWei(stakedTwo, "ether");
          resolve(stakedWeiTwo);
        })

        let promise3 = new Promise(async function (resolve) {
          const stakedThree = await contractFixedStaking.methods.staked(accounts[0], term[2]).call();
          const stakedWeiThree = web3.utils.fromWei(stakedThree, "ether");
          resolve(stakedWeiThree);
        })
        Promise.all([promise1, promise2, promise3])
          .then(async function ([result1, result2, result3]) {
            setStaked({
              stakedTermOne: numberFormat(result1, 2),
              stakedTermTwo: numberFormat(result2, 2),
              stakedTermThree: numberFormat(result3, 2),
            })
            if (numberFormat(result1, 2) > "0.00" || numberFormat(result2, 2) > "0.00" || numberFormat(result3, 2) > "0.00") {
              const Rewards1 = await contractFixedStaking.methods.rewards(accounts[0], term[0]).call();
              const Rewards2 = await contractFixedStaking.methods.rewards(accounts[0], term[1]).call();
              const Rewards3 = await contractFixedStaking.methods.rewards(accounts[0], term[2]).call();
              console.log(Rewards2)
              myInterval = setInterval(getMyRewards, 2500);

              if (Rewards1 > 0) {
                return myInterval;
              }
              if (Rewards2 > 0) {
                return myInterval;
              }
              if (Rewards3 > 0) {
                return myInterval;
              }

            } else {
              return;
            }
          })



        //tokenBeingHold
        let promiseTotalFined1 = new Promise(async function (resolve) {
          const totalFinedOne = await contractFixedStaking.methods.tokenBeingHold(accounts[0], term[0]).call();
          const totalFinedWei1 = web3.utils.fromWei(totalFinedOne, "ether");
          resolve(totalFinedWei1);
        })
        let promiseTotalFined2 = new Promise(async function (resolve) {
          const totalFinedTwo = await contractFixedStaking.methods.tokenBeingHold(accounts[0], term[1]).call();
          const totalFinedWei2 = web3.utils.fromWei(totalFinedTwo, "ether");
          resolve(totalFinedWei2);
        })
        let promiseTotalFined3 = new Promise(async function (resolve) {
          const totalFinedThree = await contractFixedStaking.methods.tokenBeingHold(accounts[0], term[2]).call();
          const totalFinedWei3 = web3.utils.fromWei(totalFinedThree, "ether");
          resolve(totalFinedWei3);
        })

        Promise.all([promiseTotalFined1, promiseTotalFined2, promiseTotalFined3])
          .then(async function ([result1, result2, result3]) {
            setTotalFined({
              totalFined1: numberFormat(result1, 2),
              totalFined2: numberFormat(result2, 2),
              totalFined3: numberFormat(result3, 2)
            })

            if (numberFormat(result1, 2) === "0.00") {
              document.getElementById('hold-token-a').style.display = 'none';
              document.getElementById('holding-token-a').style.display = 'none';
              document.getElementById('time-cooldown-a').style.display = 'none';
              document.getElementById('time-a').style.display = 'none';
              document.getElementById('stake-one').style.display = '';
              document.getElementById('approve-a').style.display = '';
              document.getElementById('claim-a').style.display = '';
            } else {
              const timeStampWithdraw = await contractFixedStaking.methods.withdrawnFromTs(accounts[0], term[0]).call();
              timeStamp.setTime(Number(timeStampWithdraw) * 1000);
              document.getElementById('holding-token-a').style.display = '';
              document.getElementById('time-cooldown-a').style.display = '';
              withDrawFromTs();
              document.getElementById('hold-token-a').style.display = '';
              document.getElementById('time-a').style.display = '';
              document.getElementById('claim-a').style.display = 'none';
              document.getElementById('stake-one').style.display = 'none';
              document.getElementById('approve-a').style.display = 'none';
            }

            if (numberFormat(result2, 2) === "0.00") {
              document.getElementById('hold-token-b').style.display = 'none';
              document.getElementById('holding-token-b').style.display = 'none';
              document.getElementById('time-cooldown-b').style.display = 'none';
              document.getElementById('time-b').style.display = 'none';
              document.getElementById('stake-two').style.display = '';
              document.getElementById('approve-b').style.display = '';
              document.getElementById('claim-b').style.display = '';
            } else {
              const timeStampWithdraw = await contractFixedStaking.methods.withdrawnFromTs(accounts[0], term[1]).call();
              timeStamp.setTime(Number(timeStampWithdraw) * 1000);
              document.getElementById('hold-token-b').style.display = '';
              document.getElementById('holding-token-b').style.display = '';
              document.getElementById('time-cooldown-b').style.display = '';
              document.getElementById('time-b').style.display = '';
              withDrawFromTs2();
              document.getElementById('stake-two').style.display = 'none';
              document.getElementById('approve-b').style.display = 'none';
              document.getElementById('claim-b').style.display = 'none';
            }

            if (numberFormat(result3, 2) === "0.00") {
              document.getElementById('hold-token-c').style.display = 'none';
              document.getElementById('time-cooldown-c').style.display = 'none';
              document.getElementById('time-c').style.display = 'none';
              document.getElementById('holding-token-c').style.display = 'none';
              document.getElementById('stake-three').style.display = '';
              document.getElementById('approve-c').style.display = '';
              document.getElementById('claim-c').style.display = '';
            } else {
              const timeStampWithdraw = await contractFixedStaking.methods.withdrawnFromTs(accounts[0], term[2]).call();
              timeStamp.setTime(Number(timeStampWithdraw) * 1000);
              document.getElementById('hold-token-c').style.display = '';
              document.getElementById('holding-token-c').style.display = '';
              document.getElementById('time-cooldown-c').style.display = '';
              document.getElementById('time-c').style.display = '';
              withDrawFromTs3()
              document.getElementById('stake-three').style.display = 'none';
              document.getElementById('approve-c').style.display = 'none';
              document.getElementById('claim-c').style.display = 'none';
            }
          })

        console.log(account)

      } catch (error) {
        console.log(error);
        return;
      }
    }
  }

  const withDrawFromTs = async () => {
    let hourTs = timeStamp.getHours();
    let minTs = timeStamp.getMinutes();
    let secTs = timeStamp.getSeconds();

    timeStamp.setMinutes(minTs + 5);

    let hours = timeStamp.getHours();
    let mins = timeStamp.getMinutes();
    let secs = timeStamp.getSeconds();

    document.getElementById('timer').innerHTML = hourTs + "h " + minTs + "m " + secTs + "s ";

    document.getElementById('timer-cd-a').innerHTML = hours + "h " + mins + "m " + secs + "s ";
  }

  const withDrawFromTs2 = async () => {
    let hourTs = timeStamp.getHours();
    let minTs = timeStamp.getMinutes();
    let secTs = timeStamp.getSeconds();

    timeStamp.setMinutes(minTs + 5);

    let hours = timeStamp.getHours();
    let mins = timeStamp.getMinutes();
    let secs = timeStamp.getSeconds();

    document.getElementById('timer-b').innerHTML = hourTs + "h " + minTs + "m " + secTs + "s ";

    document.getElementById('timer-cd-b').innerHTML = hours + "h " + mins + "m " + secs + "s ";
  }

  const withDrawFromTs3 = async () => {
    let hourTs = timeStamp.getHours();
    let minTs = timeStamp.getMinutes();
    let secTs = timeStamp.getSeconds();

    timeStamp.setMinutes(minTs + 5);

    let hours = timeStamp.getHours();
    let mins = timeStamp.getMinutes();
    let secs = timeStamp.getSeconds();

    document.getElementById('timer-c').innerHTML = hourTs + "h " + minTs + "m " + secTs + "s ";

    document.getElementById('timer-cd-c').innerHTML = hours + "h " + mins + "m " + secs + "s ";
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

      let promise1 = new Promise(async function (resolve) {
        const duration1 = await contractFixedStaking.methods.terms(term[0]).call();
        resolve(duration1.duration);
      })

      let promise2 = new Promise(async function (resolve) {
        const duration2 = await contractFixedStaking.methods.terms(term[1]).call();
        resolve(duration2.duration);
      })

      let promise3 = new Promise(async function (resolve) {
        const duration3 = await contractFixedStaking.methods.terms(term[2]).call();
        resolve(duration3.duration);
      })
      Promise.all([promise1, promise2, promise3])
        .then(function ([result1, result2, result3]) {
          if (Number(result1) === term[0] && Number(result2) === term[1] && Number(result3) === term[2]) {
            setDuration({
              durationOne: String(`${secToMin(term[0])}`),
              durationTwo: String(`${secToMin(term[1])}`),
              durationThree: String(`${secToMin(term[2])}`)
            })
          }
        })

      let promiseIr1 = new Promise(async function (resolve) {
        const duration1 = await contractFixedStaking.methods.terms(term[0]).call();
        resolve(Number(duration1.interestRate));
      })
      let promiseIr2 = new Promise(async function (resolve) {
        const duration1 = await contractFixedStaking.methods.terms(term[1]).call();
        resolve(Number(duration1.interestRate));
      })
      let promiseIr3 = new Promise(async function (resolve) {
        const duration1 = await contractFixedStaking.methods.terms(term[2]).call();
        resolve(Number(duration1.interestRate));
      })
      Promise.all([promiseIr1, promiseIr2, promiseIr3])
        .then(function ([resultIr1, resultIr2, resultIr3]) {
          setInterestRate({
            interestRateOne: resultIr1,
            interestRateTwo: resultIr2,
            interestRateThree: resultIr3
          })
        })

    } catch (error) {
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      if (staked.stakedTermOne > "0.00" || staked.stakedTermTwo > "0.00" || staked.stakedTermThree > "0.00") {
        let promiseTotalFined1 = new Promise(async function (resolve) {
          const rewardsPerSecondOne = await contractFixedStaking.methods.earnedPerSecond(term[0], signerAddress).call();
          const rewardsWeiOne = web3.utils.fromWei(rewardsPerSecondOne, "ether");
          resolve(rewardsWeiOne);

        })
        let promiseTotalFined2 = new Promise(async function (resolve) {

          const rewardsPerSecondTwo = await contractFixedStaking.methods.earnedPerSecond(term[1], signerAddress).call();
          const rewardsWeiTwo = web3.utils.fromWei(rewardsPerSecondTwo, "ether");
          resolve(rewardsWeiTwo);

        })
        let promiseTotalFined3 = new Promise(async function (resolve) {

          const rewardsPerSecondThree = await contractFixedStaking.methods.earnedPerSecond(term[2], signerAddress).call();
          const rewardsWeiThree = web3.utils.fromWei(rewardsPerSecondThree, "ether");
          resolve(rewardsWeiThree);
        })
        Promise.all([promiseTotalFined1, promiseTotalFined2, promiseTotalFined3])
          .then(function ([result1, result2, result3]) {
            setRewards({
              rewardsOne: numberFormat(result1, 2),
              rewardsTwo: numberFormat(result2, 2),
              rewardsThree: numberFormat(result3, 2)
            })
          })
          .catch(function (err) {
            console.log(err)
            return;
          })
      }

    } catch (error) {
      // console.log(error)
      return;
    }
  }

  const handleApprove = async (e) => {
    e.preventDefault();
    if (account) {
      console.log(account)
      try {
        const data = new FormData(e.target);

        if (data.get("amount") > 0) {
          const amountWei = web3.utils.toWei(data.get("amount"), "ether");
          console.log(amountWei)
          await contractToken.methods.approve(fixedStakingAddress, amountWei).send({ from: account });
          document.getElementById('stake-one').reset();
          document.getElementById('stake-two').reset();
          document.getElementById('stake-three').reset();
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

        const amountWei = web3.utils.toWei(data.get("amount"), "ether");
        const balance = await contractToken.methods.balanceOf(account).call();
        const allowance = await contractToken.methods.allowance(account, fixedStakingAddress).call();

        if (allowance <= 0) {
          return alert('Please approve amount token you want to stake');
        }
        if (data.get("amount") <= 0) {
          return alert("You must input token to staking");
        }
        if (allowance < amountWei) {
          return alert("Your stake exceed your allowance");
        }
        if (balance < amountWei) {
          return alert("Not enough balance");
        }
        if (staked.stakedTermOne > "0.00" && Number(data.get("term-one")) === term[0]) {
          return alert("The staking is not finish or you have not withdraw");
        }
        if (staked.stakedTermTwo > "0.00" && Number(data.get("term-two")) === term[1]) {
          return alert("The staking is not finish or you have not withdraw");
        }
        if (staked.stakedTermThree > "0.00" && Number(data.get("term-three")) === term[2]) {
          return alert("The staking is not finish or you have not withdraw");
        }
        if (totalFined.totalFined1 > "0.00" && Number(data.get("term-one")) === term[0]) {
          return alert("Your token is on hold")
        }
        if (totalFined.totalFined2 > "0.00" && Number(data.get("term-two")) === term[1]) {
          return alert("Your token is on hold")
        }
        if (totalFined.totalFined3 > "0.00" && Number(data.get("term-three")) === term[2]) {
          return alert("Your token is on hold")
        }
        if (data.get("term-one")) {
          await contractFixedStaking.methods.stake(data.get("term-one"), amountWei).send({ from: account });
          window.location.reload(false);
        }
        if (data.get("term-two")) {
          await contractFixedStaking.methods.stake(data.get("term-two"), amountWei).send({ from: account });
          window.location.reload(false);
        }
        if (data.get("term-three")) {
          await contractFixedStaking.methods.stake(data.get("term-three"), amountWei).send({ from: account });
          window.location.reload(false);
        }

      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      return alert("Please connect to Metamask")
    }
  };

  const handleUnStake = async (value) => {
    if (account) {
      try {
        if (value === term[0]) {
          if (staked.stakedTermOne > "0.00") {
            await contractFixedStaking.methods.withdraw(term[0]).send({ from: account });
            window.location.reload(false);
          } else {
            return alert("Nothing to claim")
          }
        }
        if (value === term[1]) {
          if (staked.stakedTermTwo > "0.00") {
            await contractFixedStaking.methods.withdraw(term[1]).send({ from: account });
            window.location.reload(false);
          } else {
            return alert("Nothing to claim")
          }
        }
        if (value === term[2]) {
          if (staked.stakedTermThree > "0.00") {
            await contractFixedStaking.methods.withdraw(term[2]).send({ from: account });
            window.location.reload(false);
          } else {
            return alert("Nothing to claim")
          }
        }

      } catch (error) {
        console.log(error)
      }
    } else {
      return alert("Please connect to Metamask")
    }
  };

  const handleUnstakeTokenHold = async (value) => {
    try {
      if (account) {
        if (value === term[0]) {
          const withdrawTs1 = await contractFixedStaking.methods.withdrawnFromTs(account, term[0]).call();

          if (staked.stakedTermOne === "0.00") {
            if (totalFined.totalFined1 > "0.00") {
              if ((Number(minToSec(5)) + Number(withdrawTs1)) < msToTime(Date.now())) {
                await contractFixedStaking.methods.afterOneDay(term[0], account).send({ from: account });
                window.location.reload(false);
              } else {
                alert("Your token is held for 5 Mins");
              }
            } else {
              alert("Your tokens are not held")
            }
          } else {
            alert("The staking time is not over yet")
          }
        }

        if (value === term[1]) {
          const withdrawTs2 = await contractFixedStaking.methods.withdrawnFromTs(account, term[1]).call();

          if (staked.stakedTermTwo === "0.00") {
            if (totalFined.totalFined2 > "0.00") {
              if ((Number(minToSec(5)) + Number(withdrawTs2)) < msToTime(Date.now())) {
                await contractFixedStaking.methods.afterOneDay(term[1], account).send({ from: account });
                window.location.reload(false);
              } else {
                alert("Your token is held for 5 Mins");
              }
            } else {
              alert("Your tokens are not held")
            }
          } else {
            alert("The staking time is not over yet")
          }
        }

        if (value === term[2]) {
          const withdrawTs3 = await contractFixedStaking.methods.withdrawnFromTs(account, term[2]).call();

          if (staked.stakedTermThree === "0.00") {
            if (totalFined.totalFined3 > "0.00") {
              if ((Number(minToSec(5)) + Number(withdrawTs3)) < msToTime(Date.now())) {
                await contractFixedStaking.methods.afterOneDay(term[2], account).send({ from: account });
                window.location.reload(false);
              } else {
                alert("Your token is held for 5 Mins");
              }
            } else {
              alert("Your tokens are not held")
            }
          } else {
            alert("The staking time is not over yet")
          }
        }

      } else {
        alert("Please connect to Metamask")
      }
    } catch (error) {
      console.log(error)
      return;
    }
  }

  let timeout;
  let doneTypingInterval = 1000;
  const checkApprove = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      let promiseAllowance1 = new Promise(async function (resolve) {
        const allowanceContract1 = contractToken.methods.allowance(signerAddress, fixedStakingAddress).call();
        resolve(allowanceContract1)
      })
      let promiseAllowance2 = new Promise(async function (resolve) {
        const allowanceContract2 = contractToken.methods.allowance(signerAddress, fixedStakingAddress).call();
        resolve(allowanceContract2)
      })
      let promiseAllowance3 = new Promise(async function (resolve) {
        const allowanceContract3 = contractToken.methods.allowance(signerAddress, fixedStakingAddress).call();
        resolve(allowanceContract3)
      })
      Promise.all([promiseAllowance1, promiseAllowance2, promiseAllowance3]).then(function ([result1, result2, result3]) {
        let etherAllowance1 = web3.utils.fromWei(result1, "ether");
        let valueKeyUp1 = document.getElementById('amountStake-a').value;

        let etherAllowance2 = web3.utils.fromWei(result2, "ether");
        let valueKeyUp2 = document.getElementById('amountStake-b').value;

        let etherAllowance3 = web3.utils.fromWei(result3, "ether");
        let valueKeyUp3 = document.getElementById('amountStake-c').value;

        timeout = setTimeout(function () {
          if (Number(etherAllowance1) >= valueKeyUp1) {
            document.getElementById('staking-a').style.display = '';
            document.getElementById('approve-a').style.display = 'none';
          } else {
            document.getElementById('staking-a').style.display = 'none';
            document.getElementById('approve-a').style.display = 'block';
          }

          if (Number(etherAllowance2) >= valueKeyUp2) {
            document.getElementById('staking-b').style.display = '';
            document.getElementById('approve-b').style.display = 'none';
          } else {
            document.getElementById('staking-b').style.display = 'none';
            document.getElementById('approve-b').style.display = 'block';
          }

          if (Number(etherAllowance3) >= valueKeyUp3) {
            document.getElementById('staking-c').style.display = '';
            document.getElementById('approve-c').style.display = 'none';
          } else {
            document.getElementById('staking-c').style.display = 'none';
            document.getElementById('approve-c').style.display = 'block';
          }
        }, doneTypingInterval)
      })
    } catch (error) {
      return;
    }
  }

  const checkTimeOut = async () => {
    clearTimeout(timeout)
  }

  return (
    <div className="box-container" onload={contractInform()}>

      <div id="connectMeta">
        <div >
          <button class="button-56" onClick={connectMetamask}>{connectButton}</button>
        </div>
        <div>
          <button class="button-56" onClick={disconnectMetamask}>Log out</button>
        </div>
      </div>
      <div className="fixed-stake">
        <div className="App" class="container">
          <div>
            <h3>STAKE TOKEN</h3>
          </div>
          <div class="front-top">
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
              <p>{balanceInfo.balance}</p>
            </div>

            <div id="bsrInfo">
              <div>Staked : </div>
              <p>{staked.stakedTermOne}</p>

            </div>

            <div id="bsrInfo">
              <div> Rewards : </div>
              <p>{rewards.rewardsOne}</p>
            </div>
          </div>

          <div class="front-bot">
            <p class="p-form">{duration.durationOne} Mins Term</p>
            <p class="p-form">APR : {interestRate.interestRateOne}%</p>
            <div>

              <form onSubmit={handleStake} id="stake-one" >
                <input
                  type="text"
                  name="amount"
                  placeholder="Amount To Stake"
                  id="amountStake-a"
                  onKeyUp={checkApprove}
                  onKeyDown={checkTimeOut}
                />
                <input type="hidden" name="term-one" value={term[0]}></input>
                <button type="submit" class="button-40" id="staking-a">
                  Stake
                </button>
              </form>

              <div className="modal fade" id="exampleModalCenter-a" role="dialog" aria-labelledby="exampleModalCenterTitle"
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
                      <button className="btn btn-primary" data-dismiss="modal" onClick={() => { handleUnStake(term[0]) }}>Continue</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex-understake">
                <button type="button" id="claim-a" class="button-41" data-toggle="modal" data-target="#exampleModalCenter-a">
                  Early Withdraw
                </button>

                <form onSubmit={handleApprove} >
                  <input type="hidden" name="amount" value="1000000"></input>
                  <button type="submit" class="button-41" id="approve-a">
                    Approve
                  </button>
                </form>
              </div>


            </div>

            <div class="tokenHeld">
              <div>
                <p class="p-form" id="holding-token-a">Holding : {totalFined.totalFined1}</p>
                <p class="p-form" id="time-cooldown-a"> Token has been held at : <span id="timer"></span></p>
                <p class="p-form" id="time-a"> Token will be withdrawn at : <span id="timer-cd-a"></span></p>
              </div>

              <div>
                <button
                  type="submit"
                  onClick={() => handleUnstakeTokenHold(term[0])}
                  class="button-41"
                  id="hold-token-a"
                >
                  Claim
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="App" class="container">
          <div>
            <h3>STAKE TOKEN</h3>
          </div>

          <div class="front-top">
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
              <p>{balanceInfo.balance}</p>
            </div>

            <div id="bsrInfo">
              <div>Staked : </div>
              <p>{staked.stakedTermTwo}</p>

            </div>

            <div id="bsrInfo">
              <div> Rewards : </div>
              <p>{rewards.rewardsTwo}</p>
            </div>
          </div>

          <div class="front-bot">
            <p class="p-form">{duration.durationTwo} Mins Term</p>
            <p class="p-form">APR : {interestRate.interestRateTwo}%</p>
            <div>
              <form onSubmit={handleStake} id="stake-two">
                <input
                  type="text"
                  name="amount"
                  placeholder="Amount to stake"
                  id="amountStake-b"
                  onKeyUp={checkApprove}
                  onKeyDown={checkTimeOut}
                />
                <input type="hidden" name="term-two" value={term[1]}></input>
                <button type="submit" class="button-40" id="staking-b">
                  Stake
                </button>
              </form>

              <div className="modal fade" id="exampleModalCenter-b" role="dialog" aria-labelledby="exampleModalCenterTitle"
                aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLongTitle">Notification</h5>
                      <button type="submit" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      If you claim before the end time, your request will go to a 5 minute cooldown.
                      You will be subject to an early withdrawal fee of (1%) and will not be able to bet back on this pool until the cooldown is over
                    </div>
                    <div className="modal-footer" >
                      <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                      <button className="btn btn-primary" data-dismiss="modal" onClick={() => { handleUnStake(term[1]) }} >Continue</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex-understake">
                <button type="submit" id="claim-b" class="button-41" data-toggle="modal" data-target="#exampleModalCenter-b">
                  Early Withdraw
                </button>

                <form onSubmit={handleApprove} >
                  <input type="hidden" name="amount" value="1000000"></input>
                  <button type="submit" class="button-41" id="approve-b">
                    Approve
                  </button>
                </form>
              </div>
            </div>

            <div class="tokenHeld">
              <div>
                <p class="p-form" id="holding-token-b">Holding : {totalFined.totalFined2}</p>
                <p class="p-form" id="time-cooldown-b"> Token has been held at : <span id="timer-b"></span></p>
                <p class="p-form" id="time-b"> Token will be withdrawn at : <span id="timer-cd-b"></span></p>
              </div>

              <div>
                <button
                  type="submit"
                  onClick={() => handleUnstakeTokenHold(term[1])}
                  class="button-41"
                  id="hold-token-b"
                >
                  Claim
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="App" class="container">
          <div>
            <h3>STAKE TOKEN</h3>
          </div>

          <div class="front-top">
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
              <p>{balanceInfo.balance}</p>
            </div>

            <div id="bsrInfo">
              <div>Staked : </div>
              <p>{staked.stakedTermThree}</p>

            </div>

            <div id="bsrInfo">
              <div> Rewards : </div>
              <p>{rewards.rewardsThree}</p>
            </div>
          </div>

          <div class="front-bot">
            <p class="p-form">{duration.durationThree} Mins Term</p>
            <p class="p-form">APR : {interestRate.interestRateThree}%</p>
            <div>
              <form onSubmit={handleStake} id="stake-three">
                <input
                  type="text"
                  name="amount"
                  placeholder="Amount to stake"
                  id="amountStake-c"
                  onKeyUp={checkApprove}
                  onKeyDown={checkTimeOut}
                />
                <input type="hidden" name="term-three" value={term[2]}></input>
                <button type="submit" class="button-40" id="staking-c">
                  Stake
                </button>
              </form>

              <div class="flex-understake">
                <button type="submit" id="claim-c" class="button-41" data-toggle="modal" data-target="#exampleModalCenter-c">
                  Early Withdraw
                </button>

                <form onSubmit={handleApprove} >
                  <input type="hidden" name="amount" value="1000000"></input>
                  <button type="submit" class="button-41" id="approve-c">
                    Approve
                  </button>
                </form>
              </div>

              <div className="modal fade" id="exampleModalCenter-c" role="dialog" aria-labelledby="exampleModalCenterTitle"
                aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLongTitle">Notification</h5>
                      <button type="submit" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      If you claim before the end time, your request will go to a 5 minute cooldown.
                      You will be subject to an early withdrawal fee of (1%) and will not be able to bet back on this pool until the cooldown is over
                    </div>
                    <div className="modal-footer" >
                      <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                      <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => { handleUnStake(term[2]) }}>Continue</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div class="tokenHeld">
              <div>
                <p class="p-form" id="holding-token-c">Holding : {totalFined.totalFined3}</p>
                <p class="p-form" id="time-cooldown-c"> Token has been held at : <span id="timer-c"></span></p>
                <p class="p-form" id="time-c"> Token will be withdrawn at : <span id="timer-cd-c"></span></p>
              </div>

              <div>
                <button
                  type="submit"
                  onClick={() => handleUnstakeTokenHold(term[2])}
                  class="button-41"
                  id="hold-token-c"
                >
                  Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div >
  );
}

export default App;
