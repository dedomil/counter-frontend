import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import * as Buffer from "buffer";
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, PublicKey, SystemProgram } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";

import Navbar from "./components/Navbar";
import idl from "./idl/idl.json";

import "./App.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const App = () => {
  return (
    <Context>
      <Content />
    </Context>
  );
};
export default App;

const Context = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content = () => {
  window.Buffer = Buffer.Buffer;

  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [isInitialized, setInitialized] = useState(false);

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new AnchorProvider(
        connection,
        anchorWallet,
        AnchorProvider.defaultOptions()
      );
      return new Program(idl, idl.metadata.address, provider);
    }
  }, [connection, anchorWallet]);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (program && publicKey) {
        try {
          let [counterPda] = PublicKey.findProgramAddressSync(
            [publicKey.toBuffer()],
            new PublicKey(program.programId)
          );
          let userAccount = await program.account.counter.fetch(counterPda);
          if (userAccount) {
            setCount(parseInt(userAccount.count.toString()));
            setInitialized(true);
          }
        } catch (error) {
          setInitialized(false);
          setCount(0);
          console.log(error);
        }
      }
    };

    fetchAccountData();
  }, [program, publicKey, pending]);

  const increment = async () => {
    if (program && publicKey) {
      setPending(true);
      try {
        let [counterPda] = PublicKey.findProgramAddressSync(
          [publicKey.toBuffer()],
          new PublicKey(program.programId)
        );
        await program.methods
          .increment()
          .accounts({
            counter: counterPda,
            authority: publicKey,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setPending(false);
      }
    }
  };

  const decrement = async () => {
    if (program && publicKey) {
      setPending(true);
      try {
        let [counterPda] = PublicKey.findProgramAddressSync(
          [publicKey.toBuffer()],
          new PublicKey(program.programId)
        );
        await program.methods
          .decrement()
          .accounts({
            counter: counterPda,
            authority: publicKey,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setPending(false);
      }
    }
  };

  const initialize = async () => {
    if (program && publicKey) {
      setPending(true);
      try {
        let [counterPda] = PublicKey.findProgramAddressSync(
          [publicKey.toBuffer()],
          new PublicKey(program.programId)
        );
        await program.methods
          .initialize()
          .accounts({
            authority: publicKey,
            counter: counterPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setPending(false);
      }
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className="flex flex-col h-fill justify-center items-center">
        {publicKey ? (
          isInitialized ? (
            <>
              <span id="counter" style={{ fontSize: "10rem" }}>
                {count}
              </span>
              <div>
                <button className="btn btn-primary mx-1" onClick={increment}>
                  Increment
                </button>
                <button className="btn btn-primary mx-1" onClick={decrement}>
                  Decrement
                </button>
              </div>
            </>
          ) : (
            <button className="btn btn-primary mx-1" onClick={initialize}>
              Initialize
            </button>
          )
        ) : (
          "Please connect your wallet"
        )}
      </div>
    </div>
  );
};
