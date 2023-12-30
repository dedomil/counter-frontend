import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Counter</a>
      </div>
      <div className="flex-none">
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default Navbar;
