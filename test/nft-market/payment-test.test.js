const chai = require("chai");
const { BigNumber, Contract, constants, utils } = require("ethers");
const {
  solidity,
  MockProvider,
  createFixtureLoader,
  deployContract,
} = require("ethereum-waffle");
const {
  mineBlock,
  expandTo18Decimals,
  toHumanVal,
  toBigNumber,
  DELAY,
  ADDRESS_ZERO,
} = require("../utils/utils");
const {
  takeSnapshot,
  advanceTime,
  revertTime,
} = require("../utils/time-travel");
const {
  expandToEthers,
  addNumbers,
  subNumbers,
  toBNumber,
} = require("../utils/mathHelp");
const expect = chai.expect;
chai.use(solidity);
const provider = new MockProvider({
  ganacheOptions: {
    hardfork: "istanbul",
    mnemonic: "horn horn horn horn horn horn horn horn horn horn horn horn",
    gasLimit: 9999999,
  },
});

const overrides = {
  gasLimit: 9999999,
};
const accounts = provider.getWallets();
const [
  wallet,
  other0,
  other1,
  other2,
  other3,
  other4,
  other5,
  other6,
  other7,
  other8,
  other9,
] = accounts;
const stallionMetadataHash = "QmPMzRbSmpYdhNfoLatxY4JBwTBD1kCjSdrr86rxYUdRXk";

const dolphinMetadataHash = "QmbCLTJQpd3o3vPpTo1RzcxL6RB9gsZFjxgjUwvpXXJcLS";

const unicornMetadataHash = "QmNZYxgXThVB4mw2f6dD8UF2mxNvRbupnxwqfkXMbgHj9o";

const zebraUnicornMetadataHash =
  "QmcAaZmBmzgVngHVHJc6nUgtkHGhRiX6L4ofvjupGn6YPT";

const albinoGorillaMetadataHash =
  "QmS7r1t5SEQm8hPAZGkU7rf9mVnpYvfy2Q16SE1FUgLFja";

const diamondMetadataHash = "QmdAQnWcLKEaZdCrQm8ssEcr7T3fkPK8Bj7NGwobd3Vmtx";

let nftMktplace,
  coterieNftToken,
  nftToken,
  paymentToken,
  royaltyRegistry,
  unsupportedPmt;
beforeEach(async () => {
  const NftToken = await ethers.getContractFactory("BASICNFT", wallet);
  nftToken = await NftToken.deploy();
  const RoyaltyRegistry = await ethers.getContractFactory("Registry", wallet);
  royaltyRegistry = await RoyaltyRegistry.deploy();
  const PaymentToken = await ethers.getContractFactory("ERC20Token", wallet);
  paymentToken = await PaymentToken.deploy("Basic Token", "Basic");
  const usPaymentToken = await ethers.getContractFactory("ERC20Token", wallet);
  unsupportedPmt = await usPaymentToken.deploy("Unsupported", "usp");
  const CoterieNftToken = await ethers.getContractFactory("CoterieNFT", wallet);
  coterieNftToken = await CoterieNftToken.deploy();
  const NftMktplace = await ethers.getContractFactory(
    "ERC721Marketplace",
    wallet,
  );
  nftMktplace = await NftMktplace.deploy(wallet.address);
  // add registry, coterieERC721, and paymentMethods
  await nftMktplace.addSupportedpaymentMethods(
    [paymentToken.address],
    overrides,
  );
  await nftMktplace.addCoterieERC721(coterieNftToken.address, overrides);
  await nftMktplace.addRoyaltyRegistry(royaltyRegistry.address, overrides);
  await coterieNftToken.addMinter(other0.address, overrides);
  await coterieNftToken.addMinter(other1.address, overrides);
  await coterieNftToken.addMinter(other2.address, overrides);
  await coterieNftToken.addMinter(other3.address, overrides);
});
const advanceBlock = async (times) => {
  for (let i = 0; i < times; i++) {
    await provider.send("evm_mine");
  }
};
describe("Nft marketplace payment", () => {
  // it("support tokens with no royalty", async () => {
  //   await nftToken
  //     .connect(other0)
  //     .mint(other0.address, diamondMetadataHash, overrides);
  //   await nftToken.connect(other0).approve(nftMktplace.address, 1, overrides);
  //   const payTo = [{ to: other0.address, percent: "1000" }];
  //   await nftMktplace
  //     .connect(other0)
  //     .createAuction(
  //       payTo,
  //       nftToken.address,
  //       1,
  //       expandToEthers(1).toString(10),
  //       constants.AddressZero,
  //       overrides,
  //     );
  //   await nftMktplace
  //     .connect(other1)
  //     .makeBid(1, expandToEthers(1).toString(10), {
  //       ...overrides,
  //       value: expandToEthers(1).toString(10),
  //     });
  //   expect(
  //     (
  //       await nftMktplace.viewRoyaltyPayments(
  //         nftToken.address,
  //         1,
  //         expandToEthers(1).toString(10),
  //       )
  //     ).total,
  //   ).to.eq(0);
  //   const payment = await nftMktplace.getOwnerPayment(
  //     nftToken.address,
  //     1,
  //     expandToEthers(1).toString(10),
  //   );
  //   takeSnapshot(provider);
  //   await advanceTime(provider, DELAY());
  //   await expect(await nftMktplace.connect(other1).closeAuction(1, overrides))
  //     .to.emit(nftMktplace, "OwnersPayment")
  //     .withArgs(1, other0.address, payment);
  //   revertTime(provider);
  // });
  // it("support payment distribution for collaborative sales", async () => {
  //   await coterieNftToken
  //     .connect(other0)
  //     .mintWithRoyalty(
  //       other0.address,
  //       stallionMetadataHash,
  //       [other0.address],
  //       [BigNumber.from(100)],
  //       overrides,
  //     );
  //   await coterieNftToken
  //     .connect(other0)
  //     .approve(nftMktplace.address, 1, overrides);
  //   const payTo = [
  //     { to: other0.address, percent: "500" },
  //     { to: other1.address, percent: "250" },
  //     { to: other2.address, percent: "250" },
  //   ];
  //   await nftMktplace
  //     .connect(other0)
  //     .createAuction(
  //       payTo,
  //       coterieNftToken.address,
  //       1,
  //       expandToEthers(1).toString(10),
  //       constants.AddressZero,
  //       overrides,
  //     );
  //   await nftMktplace
  //     .connect(other6)
  //     .makeBid(1, expandToEthers(1.5).toString(10), {
  //       ...overrides,
  //       value: expandToEthers(1.5).toString(10),
  //     });
  //   takeSnapshot(provider);
  //   await advanceTime(provider, DELAY());
  //   const payment = await nftMktplace.getOwnerPayment(
  //     coterieNftToken.address,
  //     1,
  //     expandToEthers(1.5).toString(10),
  //   );
  //   await expect(nftMktplace.connect(other0).closeAuction(1, overrides))
  //     .to.emit(nftMktplace, "OwnersPayment")
  //     .withArgs(1, other0.address, payment.div(2))
  //     .withArgs(1, other1.address, payment.div(4))
  //     .withArgs(1, other2.address, payment.div(4));

  //   revertTime(provider);
  // });
  // it("support royalty distribution for multiple artists", async () => {
  //   await coterieNftToken
  //     .connect(other0)
  //     .mintWithRoyalty(
  //       other0.address,
  //       stallionMetadataHash,
  //       [other0.address, other1.address, other2.address],
  //       [BigNumber.from(200), BigNumber.from(200), BigNumber.from(200)], //6% in total
  //       overrides,
  //     );
  //   await coterieNftToken
  //     .connect(other0)
  //     .approve(nftMktplace.address, 1, overrides);
  //   const payTo = [
  //     { to: other0.address, percent: "500" },
  //     { to: other1.address, percent: "250" },
  //     { to: other2.address, percent: "250" },
  //   ];
  //   await nftMktplace
  //     .connect(other0)
  //     .createAuction(
  //       payTo,
  //       coterieNftToken.address,
  //       1,
  //       expandToEthers(1).toString(10),
  //       constants.AddressZero,
  //       overrides,
  //     );
  //   await nftMktplace
  //     .connect(other6)
  //     .makeBid(1, expandToEthers(1.5).toString(10), {
  //       ...overrides,
  //       value: expandToEthers(1.5).toString(10),
  //     });
  //   takeSnapshot(provider);
  //   await advanceTime(provider, DELAY());
  //   const payment = await nftMktplace.viewRoyaltyPayments(
  //     coterieNftToken.address,
  //     1,
  //     expandToEthers(1.5).toString(10),
  //   );
  //   console.log("RoyaltyPaid total: ", payment.total.toString())
  //   await expect(nftMktplace.connect(other0).closeAuction(1, overrides))
  //     .to.emit(nftMktplace, "RoyaltyPaid")
  //     .withArgs(1, other0.address, payment.total.div(3), constants.AddressZero)
  //     .withArgs(1, other1.address, payment.total.div(3), constants.AddressZero)
  //     .withArgs(1, other2.address, payment.total.div(3), constants.AddressZero);

  //   revertTime(provider);
  // });
  it("calc. refBonus and pay from platform share", async () => {
    await coterieNftToken
      .connect(other0)
      .mintWithRoyalty(
        other0.address,
        stallionMetadataHash,
        [other0.address],
        [BigNumber.from(200)],
        overrides,
      );
    await coterieNftToken
      .connect(other0)
      .approve(nftMktplace.address, 1, overrides);
    const payTo = [{ to: other0.address, percent: "1000" }];
    await nftMktplace
      .connect(other0)
      .createAuction(
        payTo,
        coterieNftToken.address,
        1,
        expandToEthers(1).toString(10),
        constants.AddressZero,
        overrides,
      );
    await nftMktplace
      .connect(other6)
      .makeBid(1, expandToEthers(1.5).toString(10), {
        ...overrides,
        value: expandToEthers(1.5).toString(10),
      });
    takeSnapshot(provider);
    await advanceTime(provider, DELAY());
    const payment = await nftMktplace.getPlatformCut(
      1,
      other0.address,
      expandToEthers(1.5).toString(10),
    );
    await expect(nftMktplace.connect(other0).closeAuction(1, overrides))
      .to.emit(nftMktplace, "ReferralDue")
      .withArgs(1, wallet.address, payment.refCut, constants.AddressZero)

      .to.emit(nftMktplace, "ServiceFees")
      .withArgs(wallet.address, 1, constants.AddressZero, payment._total);

    revertTime(provider);
  });
});
