import "@/components/FrontHome/Bottom/InsertCoins/InsertCoins.scss";
import CoinsImage from "@/assets/insert-coins.webp";
import Logo from "@/assets/catsofy.webp";

const InsertCoins = ({ coins = 5, onInsertCoin, isInsertCoinFlipped }) => {
  return (
    <div className="insert-coins-box">
      <div className={`insert-coins ${isInsertCoinFlipped ? "flipped" : ""}`}>
        {/* Front side insert coins */}
        <div className="insert-coins__front">
          <img
            className="insert-coins__image"
            src={CoinsImage}
            width={224}
            height={156}
            alt="Coins image"
            title="Insert coins"
          />
          {/* display coins */}
          <div className="insert-coins__display">
            <span className="insert-coins__count">{coins}</span>
          </div>
          {/* button coins*/}
          <button
            className="insert-coins__button"
            onClick={onInsertCoin}
            aria-label="Insert coins"
          />
        </div>

        {/* Back side logo */}
        <div className="insert-coins__back">
          <img
            src={Logo}
            width={224}
            height={156}
            title="Catsofai"
            alt="Logo"
          />
        </div>
      </div>
    </div>
  );
};

export default InsertCoins;
