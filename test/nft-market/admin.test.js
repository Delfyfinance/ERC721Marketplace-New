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
  delfyNftToken,
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
  const DelfyNftToken = await ethers.getContractFactory("DelfyNFT", wallet);
  delfyNftToken = await DelfyNftToken.deploy();
  const NftMktplace = await ethers.getContractFactory(
    "ERC721Marketplace",
    wallet,
  );
  nftMktplace = await NftMktplace.deploy(wallet.address);
  // add registry, delfyNft, and paymentMethods
  await nftMktplace.addSupportedpaymentMethods(
    [paymentToken.address],
    overrides,
  );
  await nftMktplace.addDelfyERC721(delfyNftToken.address, overrides);
  await nftMktplace.addRoyaltyRegistry(royaltyRegistry.address, overrides);
  await delfyNftToken.addMinter(other0.address, overrides);
  await delfyNftToken.addMinter(other1.address, overrides);
  await delfyNftToken.addMinter(other2.address, overrides);
  await delfyNftToken.addMinter(other3.address, overrides);
});

const advanceBlock = async (times) => {
  for (let i = 0; i < times; i++) {
    await provider.send("evm_mine");
  }
};
describe("Nft marketplace", () => {
  it("pause", async () => {
    await delfyNftToken
      .connect(other0)
      .mint(
        other0.address,
        stallionMetadataHash,
        [other0.address],
        [BigNumber.from(50)],
        overrides,
      );
    await delfyNftToken
      .connect(other0)
      .approve(nftMktplace.address, 1, overrides);
    await expect(
      nftMktplace.connect(other0).pause(overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await nftMktplace.pause(overrides);
    expect(await nftMktplace.paused()).to.be.true;
    const payTo = [{ to: other0.address, percent: "1000" }];

    await expect(
      nftMktplace
        .connect(other0)
        .createAuction(
          payTo,
          delfyNftToken.address,
          1,
          expandToEthers(1).toString(10),
          constants.AddressZero,
          overrides,
        ),
    ).to.be.revertedWith("DelfyMarket: only_when_not_paused");
    expect(await nftMktplace.admin()).to.eq(wallet.address);
    expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
  });

  it("updates vault", async () => {
    await expect(
      nftMktplace
        .connect(other0)
        .updatePlatformVault(other0.address, overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await nftMktplace.updatePlatformVault(other1.address, overrides);
    expect(await nftMktplace.platformVault()).to.eq(other1.address);
    expect(await nftMktplace.admin()).to.eq(wallet.address);
    expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
  });
  it("updates platform cut", async () => {
    await expect(
      nftMktplace.connect(other0).updatePlatformCut(20, overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await nftMktplace.updatePlatformCut(10, overrides);
    expect(await nftMktplace.platformCut()).to.eq(10);
  });
  it("updates add delfy erc 721", async () => {
    await expect(
      nftMktplace.connect(other0).addDelfyERC721(nftToken.address, overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    expect(await nftMktplace.admin()).to.eq(wallet.address);
    expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
  });
  it("add supported payment methods", async () => {
    await expect(
      nftMktplace
        .connect(other0)
        .addSupportedpaymentMethods([unsupportedPmt.address], overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    expect(await nftMktplace.admin()).to.eq(wallet.address);
    expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
  });
  it("update bid window", async () => {
    await expect(
      nftMktplace.connect(other0).updateBidWindow(DELAY(), overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await nftMktplace.updateBidWindow(DELAY() + 5000, overrides);
    expect(await nftMktplace.bidWindow()).to.eq(DELAY() + 5000);
    expect(await nftMktplace.admin()).to.eq(wallet.address);
    expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
  });

  it("allows admin to cancel auction and refund bidder", async () => {
    await delfyNftToken.connect(other0).mint(
      other0.address,
      stallionMetadataHash,
      [other0.address],
      [BigNumber.from(50)], // 0.5%
      overrides,
    );
    await delfyNftToken
      .connect(other0)
      .approve(nftMktplace.address, 1, overrides);
    const payTo = [{ to: other0.address, percent: "1000" }];

    await nftMktplace
      .connect(other0)
      .createAuction(
        payTo,
        delfyNftToken.address,
        1,
        expandToEthers(1).toString(10),
        constants.AddressZero,
        overrides,
      );
    await nftMktplace
      .connect(other2)
      .makeBid(1, expandToEthers(1.5).toString(10), {
        ...overrides,
        value: expandToEthers(1.5).toString(10),
      });
    const bidderBalance = await provider.getBalance(other2.address);
    await expect(
      nftMktplace.connect(other1).adminCancelAuction(1, overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await nftMktplace.connect(wallet).adminCancelAuction(1, overrides);
    const finalBalance = await provider.getBalance(other2.address);
    expect(await delfyNftToken.ownerOf(1)).to.eq(other0.address);
    expect(await nftMktplace.admin()).to.eq(wallet.address);
    expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
    expect(finalBalance.toString()).to.eq(
      bidderBalance.add(expandToEthers(1.5).toString(10)).toString(),
    );
  });

  it("change pending admin and reject", async () => {
    await expect(
      nftMktplace.connect(other1).changeAdmin(other1.address, overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await nftMktplace.changeAdmin(other1.address, overrides);
    expect(await nftMktplace.pendingAdmin()).to.eq(other1.address);
    await expect(
      nftMktplace.connect(other1).rejectPendingAdmin(overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await nftMktplace.rejectPendingAdmin(overrides);
    expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
  });

  it("change pending admin and accept", async () => {
    await nftMktplace.changeAdmin(other1.address, overrides);
    expect(await nftMktplace.pendingAdmin()).to.eq(other1.address);
    takeSnapshot(provider);
    await advanceTime(provider, DELAY() + DELAY());
    await expect(
      nftMktplace.connect(other1).acceptPendingAdmin(overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await nftMktplace.acceptPendingAdmin(overrides);
    expect(await nftMktplace.admin()).to.eq(other1.address);
    expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
    expect(await nftMktplace.changeAdminDelay()).to.eq(0);
    revertTime(provider);
  });
});
