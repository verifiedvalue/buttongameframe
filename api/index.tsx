
import { Button, Frog, parseEther } from 'frog';
import {ethers} from 'ethers'
import { devtools } from 'frog/dev'
import abi from './abi.json';
import { serveStatic } from 'frog/serve-static'
import { degen } from "viem/chains";
import { http, createPublicClient, formatEther } from "viem";



const CONTRACT = "0xEEbD89daFA4Cb57ED0342A5405b84D2f7a059e96";
const ethProvider = new ethers.JsonRpcProvider('https://eth-mainnet.public.blastapi.io');
const publicClient = createPublicClient({
  chain: degen,
  transport: http()
});


export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})


app.use('/*', serveStatic({ root: './public' }))

app.frame('/', async (c) => {
//const gameStats = await getGame() as String;
 
async function getGameStats(){
  console.log("Getting Stats")
  //const chainId = await publicClient.getChainId()



  try {
    //Block Getter
    const blockNumber = await publicClient.readContract({
      address: CONTRACT,
      abi: abi,
      functionName: "getBlock",
    }) as bigint;

    //Winner Getter
    var currentWinner = await publicClient.readContract({
      address: CONTRACT,
      abi: abi,
      functionName: "currentWinner",
    }) as string;
    console.log("Winner:", currentWinner);

    //Pot Getter
    const potAmt = await publicClient.readContract({
      address: CONTRACT,
      abi: abi,
      functionName: "pot",
    });
    const potDegen = formatEther(potAmt as bigint);
    console.log("Pot Amount: ", potDegen);

    //Blocks Getter
    const endBlock = await publicClient.readContract({
      address: CONTRACT,
      abi: abi,
      functionName: "blockTarget",
    });
    var blocksToGo = ((endBlock as bigint)-blockNumber);

    var ensName = await ethProvider.lookupAddress(currentWinner);
    if (ensName !== null){
      currentWinner = ensName;
    } else {
      currentWinner = currentWinner.substring(0, 6);
    }

    console.log("Blocks To Go: ", blocksToGo);
    // return [currentWinner, potDegen, blocksToGo]
    if (blocksToGo < 0) {
      return {
        currentWinner: currentWinner.toString(),
        potDegen: potDegen.toString(),
        blocksToGo: 'game over'
    };
    } else {
      
      return {
        currentWinner: currentWinner.toString(),
        potDegen: potDegen.toString(),
        blocksToGo: blocksToGo.toString()
    };
    }

  } catch (error) {
    console.log("Could not fetch game stats");
    return error;
  }
}

const { currentWinner, potDegen, blocksToGo } = await getGameStats();

return c.res({
  image: (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center', // Centers children vertically within the container
      alignItems: 'center', // Centers children horizontally within the container
      fontSize: 60,
      textAlign: 'center',
      width: '100vw', // Viewport width to ensure full coverage horizontally
      height: '100vh', // Viewport height to ensure full coverage vertically
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'black'
    }}>
      <div style={{
        color: 'purple',
        fontSize: 60,
      }}>BUTTON GAME</div>

      <div style={{
        color: 'purple',
        fontSize: 40,
      }}>last degen to press the button wins</div>

      
      <div id="pot" style={{ //POT LOGIC
        display: 'flex',
        color: 'white',
        fontSize: 40,
      }}>
        <div style={{
        color: 'white',
        fontSize: 40,
      }}>pot  | 🎩</div>
      <div style={{
        color: 'green',
        fontSize: 40,
      }}>{potDegen}</div>
      </div>


      <div id="winner" style={{ //WINNER LOGIC
        display: 'flex',
        color: 'white',
        fontSize: 40,
      }}>
        <div style={{
        color: 'white',
        fontSize: 40,
      }}>last degen  |</div>
      <div style={{
        color: 'white',
        fontSize: 40,
      }}>{currentWinner}</div>
      </div>



      <div id="blocks" style={{ //BLOCKS LOGIC
        display: 'flex',
        color: 'white',
        fontSize: 40,
      }}>
        <div style={{
        color: 'white',
        fontSize: 40,
      }}>blocks left  |</div>
      <div style={{
        color: 'white',
        fontSize: 40,
      }}>{blocksToGo}</div>
      </div>



      <div style={{ //FOOTER
        color: 'purple',
        fontSize: 60,
      }}>degens only</div>
    </div>
    
  
    

    
    
    


  ),
  intents: [
    <Button action="/">stats ⟳</Button>, 
    <Button.Link href="https://explorer.degen.tips/address/0x755cf904fC21FD7Cd35f56a235107c2D871307f2">contract</Button.Link>, 
    <Button.Link href="https://buttongame.xyz">website</Button.Link>,
    <Button.Transaction target="/play">play</Button.Transaction>,
  ]
})
});

app.transaction('/play', async (c) => {
  console.log("Calling play function");
  console.log(c.contract({
    abi,  // Ensure 'abi' is properly defined and imported
    chainId: 'eip155:666666666',  // Use a valid chain ID, e.g., '1' for Ethereum Mainnet
    functionName: 'play',
    args: [],  // Assuming 'play' function does not require arguments
    to: CONTRACT,  // Ensure 'CONTRACT' is the correct contract address
    value: parseEther('1'),  // Use string for large integers to avoid issues
  }))


  return c.contract({
    abi,  // Ensure 'abi' is properly defined and imported
    chainId: 'eip155:666666666',  // Use a valid chain ID, e.g., '1' for Ethereum Mainnet
    functionName: 'play',
    args: [],  // Assuming 'play' function does not require arguments
    to: CONTRACT,  // Ensure 'CONTRACT' is the correct contract address
    value: parseEther('1'),  // Use string for large integers to avoid issues
  })
});

devtools(app, { serveStatic });