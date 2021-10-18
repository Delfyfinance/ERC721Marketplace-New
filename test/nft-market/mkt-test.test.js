// const chai = require("chai");
// const { BigNumber, Contract, constants, utils } = require("ethers");
// const {
//   solidity,
//   MockProvider,
//   createFixtureLoader,
//   deployContract,
// } = require("ethereum-waffle");
// const {
//   mineBlock,
//   expandTo18Decimals,
//   toHumanVal,
//   toBigNumber,
//   DELAY,
//   ADDRESS_ZERO,
// } = require("../utils/utils");
// const {
//   takeSnapshot,
//   advanceTime,
//   revertTime,
// } = require("../utils/time-travel");
// const {
//   expandToEthers,
//   addNumbers,
//   subNumbers,
//   toBNumber,
// } = require("../utils/mathHelp");
// const expect = chai.expect;
// chai.use(solidity);
// const provider = new MockProvider({
//   ganacheOptions: {
//     hardfork: "istanbul",
//     mnemonic: "horn horn horn horn horn horn horn horn horn horn horn horn",
//     gasLimit: 9999999,
//   },
// });

// const overrides = {
//   gasLimit: 9999999,
// };
// const accounts = provider.getWallets();
// const [
//   wallet,
//   other0,
//   other1,
//   other2,
//   other3,
//   other4,
//   other5,
//   other6,
//   other7,
//   other8,
//   other9,
// ] = accounts;
// const stallionMetadataHash = "QmPMzRbSmpYdhNfoLatxY4JBwTBD1kCjSdrr86rxYUdRXk";

// const dolphinMetadataHash = "QmbCLTJQpd3o3vPpTo1RzcxL6RB9gsZFjxgjUwvpXXJcLS";

// const unicornMetadataHash = "QmNZYxgXThVB4mw2f6dD8UF2mxNvRbupnxwqfkXMbgHj9o";

// const zebraUnicornMetadataHash =
//   "QmcAaZmBmzgVngHVHJc6nUgtkHGhRiX6L4ofvjupGn6YPT";

// const albinoGorillaMetadataHash =
//   "QmS7r1t5SEQm8hPAZGkU7rf9mVnpYvfy2Q16SE1FUgLFja";

// const diamondMetadataHash = "QmdAQnWcLKEaZdCrQm8ssEcr7T3fkPK8Bj7NGwobd3Vmtx";

// let nftMktplace,
//   coterieNftToken,
//   nftToken,
//   paymentToken,
//   royaltyRegistry,
//   unsupportedPmt;
// beforeEach(async () => {
//   const NftToken = await ethers.getContractFactory("BASICNFT", wallet);
//   nftToken = await NftToken.deploy();
//   const RoyaltyRegistry = await ethers.getContractFactory("Registry", wallet);
//   royaltyRegistry = await RoyaltyRegistry.deploy();
//   const PaymentToken = await ethers.getContractFactory("ERC20Token", wallet);
//   paymentToken = await PaymentToken.deploy("Basic Token", "Basic");
//   const usPaymentToken = await ethers.getContractFactory("ERC20Token", wallet);
//   unsupportedPmt = await usPaymentToken.deploy("Unsupported", "usp");
//   const CoterieNftToken = await ethers.getContractFactory("CoterieNFT", wallet);
//   coterieNftToken = await CoterieNftToken.deploy();
//   const NftMktplace = await ethers.getContractFactory(
//     "ERC721Marketplace",
//     wallet,
//   );
//   nftMktplace = await NftMktplace.deploy(wallet.address);
//   // add registry, delfyNft, and paymentMethods
//   await nftMktplace.addSupportedpaymentMethods(
//     [paymentToken.address],
//     overrides,
//   );
//   await nftMktplace.addCoterieERC721(coterieNftToken.address, overrides);
//   await nftMktplace.addRoyaltyRegistry(royaltyRegistry.address, overrides);
//   await coterieNftToken.addMinter(other0.address, overrides);
//   await coterieNftToken.addMinter(other1.address, overrides);
//   await coterieNftToken.addMinter(other2.address, overrides);
//   await coterieNftToken.addMinter(other3.address, overrides);
// });

// const advanceBlock = async (times) => {
//   for (let i = 0; i < times; i++) {
//     await provider.send("evm_mine");
//   }
// };
// describe("Nft marketplace", () => {
//   it("sets the basics", async () => {
//     expect(await nftMktplace.platformVault()).to.eq(wallet.address);
//     expect(await nftMktplace.coterieERC721()).to.eq(coterieNftToken.address);
//     expect(await nftMktplace.ROYALTY_REGISTRY()).to.eq(royaltyRegistry.address);
//     expect(await nftMktplace.isSupportedPaymentMethod(paymentToken.address)).to
//       .be.true;
//     expect(await coterieNftToken.isMinter(other0.address)).to.be.true;
//     expect(await nftMktplace.admin()).to.eq(wallet.address);
//     expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
//   });
//   it("create auction with valid args", async () => {
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 1, overrides);
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 2, overrides);
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 3, overrides);
//     const payTo = [{ to: other0.address, percent: "1000" }];
//     await nftMktplace
//       .connect(other0)
//       .createAuction(
//         payTo,
//         coterieNftToken.address,
//         1,
//         expandToEthers(1).toString(10),
//         constants.AddressZero,
//         overrides,
//       );
//     expect((await nftMktplace.getOwnerAuctions(other0.address)).length).to.eq(
//       1,
//     );
//     expect(await coterieNftToken.ownerOf(1)).to.eq(nftMktplace.address);
//     await expect(
//       nftMktplace
//         .connect(other0)
//         .createAuction(
//           payTo,
//           coterieNftToken.address,
//           2,
//           expandToEthers(1).toString(10),
//           unsupportedPmt.address,
//           overrides,
//         ),
//     ).to.be.revertedWith("CoterieMarket: only supported payment methods");
//     await expect(
//       nftMktplace
//         .connect(other0)
//         .createAuction(
//           [{ to: other0.address, percent: "1100" }],
//           coterieNftToken.address,
//           2,
//           expandToEthers(1).toString(10),
//           unsupportedPmt.address,
//           overrides,
//         ),
//     ).to.be.revertedWith("CoterieMarket: invalid payment distribution");
//     await expect(
//       nftMktplace.connect(other0).createAuction(
//         [
//           { to: other0.address, percent: "10" },
//           { to: wallet.address, percent: "10" },
//           { to: other1.address, percent: "10" },
//           { to: other2.address, percent: "10" },
//           { to: other3.address, percent: "10" },
//           { to: other4.address, percent: "10" },
//           { to: other5.address, percent: "10" },
//           { to: other6.address, percent: "10" },
//           { to: other7.address, percent: "10" },
//           { to: other8.address, percent: "10" },
//           { to: other0.address, percent: "10" },
//         ],
//         coterieNftToken.address,
//         2,
//         expandToEthers(1).toString(10),
//         paymentToken.address,
//         overrides,
//       ),
//     ).to.be.revertedWith("CoterieMarket: invalid payto length");
//     expect(await nftMktplace.admin()).to.eq(wallet.address);
//     expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
//   });
//   it("allow bid with eth, revert low bid value after the first bid and overrides lower bids", async () => {
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 1, overrides);
//     const payTo = [{ to: other0.address, percent: "1000" }];
//     await nftMktplace
//       .connect(other0)
//       .createAuction(
//         payTo,
//         coterieNftToken.address,
//         1,
//         expandToEthers(1).toString(10),
//         constants.AddressZero,
//         overrides,
//       );
//     await nftMktplace
//       .connect(other2)
//       .makeBid(1, expandToEthers(1.5).toString(10), {
//         ...overrides,
//         value: expandToEthers(1.5).toString(10),
//       });
//     expect(await provider.getBalance(nftMktplace.address)).to.eq(
//       expandToEthers(1.5).toString(10),
//     );
//     await expect(
//       nftMktplace
//         .connect(other2)
//         .makeBid(1, expandToEthers(1.51).toString(10), {
//           ...overrides,
//           value: expandToEthers(1.51).toString(10),
//         }),
//     ).to.be.revertedWith("CoterieMarket: Bid_value_must_be_>current_bid_value");
//     const balance = await provider.getBalance(other2.address);
//     await nftMktplace
//       .connect(other3)
//       .makeBid(1, expandToEthers(1.651).toString(10), {
//         // overrides at just above 10%
//         ...overrides,
//         value: expandToEthers(1.651).toString(10),
//       });
//     expect(await provider.getBalance(nftMktplace.address)).to.eq(
//       expandToEthers(1.651).toString(10),
//     );

//     expect(await provider.getBalance(other2.address)).to.eq(
//       BigNumber.from(expandToEthers(1.5).toString()).add(balance),
//     );
//     expect(await nftMktplace.admin()).to.eq(wallet.address);
//     expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
//   });
//   it("allow bid with ERC20, revert low bid value after the first bid, and overrides lower bids", async () => {
//     await paymentToken.transfer(
//       other1.address,
//       expandToEthers(50).toString(10),
//       overrides,
//     );
//     await paymentToken
//       .connect(other1)
//       .approve(nftMktplace.address, expandToEthers(50).toString(10), overrides);
//     await paymentToken.transfer(
//       other2.address,
//       expandToEthers(50).toString(10),
//       overrides,
//     );
//     await paymentToken
//       .connect(other2)
//       .approve(nftMktplace.address, expandToEthers(50).toString(10), overrides);
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 1, overrides);
//     const payTo = [{ to: other0.address, percent: "1000" }];
//     await nftMktplace
//       .connect(other0)
//       .createAuction(
//         payTo,
//         coterieNftToken.address,
//         1,
//         expandToEthers(1).toString(10),
//         paymentToken.address,
//         overrides,
//       );
//     await nftMktplace
//       .connect(other1)
//       .makeBid(1, expandToEthers(1.5).toString(10), {
//         ...overrides,
//       });
//     expect(await paymentToken.balanceOf(nftMktplace.address)).to.eq(
//       expandToEthers(1.5).toString(10),
//     );
//     await expect(
//       nftMktplace
//         .connect(other2)
//         .makeBid(1, expandToEthers(1.51).toString(10), {
//           ...overrides,
//         }),
//     ).to.be.revertedWith("CoterieMarket: Bid_value_must_be_>current_bid_value");
//     const balance = await paymentToken.balanceOf(other1.address);
//     await nftMktplace
//       .connect(other2)
//       .makeBid(1, expandToEthers(1.651).toString(10), {
//         // overrides at just above 10%
//         ...overrides,
//       });
//     expect(await paymentToken.balanceOf(nftMktplace.address)).to.eq(
//       expandToEthers(1.651).toString(10),
//     );
//     expect(await paymentToken.balanceOf(other1.address)).to.eq(
//       BigNumber.from(expandToEthers(1.5).toString()).add(balance),
//     );
//     expect(await nftMktplace.admin()).to.eq(wallet.address);
//     expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
//   });
//   it("close bids after due 24 hours eth", async () => {
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 1, overrides);
//     const payTo = [{ to: other0.address, percent: "1000" }];
//     await nftMktplace
//       .connect(other0)
//       .createAuction(
//         payTo,
//         coterieNftToken.address,
//         1,
//         expandToEthers(1).toString(10),
//         constants.AddressZero,
//         overrides,
//       );
//     await nftMktplace
//       .connect(other2)
//       .makeBid(1, expandToEthers(1.5).toString(10), {
//         ...overrides,
//         value: expandToEthers(1.5).toString(10),
//       });
//     takeSnapshot(provider);
//     const balance = await provider.getBalance(other0.address);
//     await advanceTime(provider, DELAY());
//     await expect(
//       nftMktplace.connect(other3).closeAuction(1, overrides),
//     ).to.be.revertedWith("CoterieMarket: only_auction_owner_and_lastBidder");
//     await nftMktplace.connect(other2).closeAuction(1, overrides);
//     const pay = await nftMktplace.viewRoyaltyPayments(
//       coterieNftToken.address,
//       1,
//       expandToEthers(1.5).toString(10),
//     );
//     const ownerPay = await nftMktplace.getOwnerPayment(
//       coterieNftToken.address,
//       1,
//       expandToEthers(1.5).toString(10),
//     );
//     // Royalty goes to same person because he's the original creator
//     expect((await provider.getBalance(other0.address)).toString()).to.eq(
//       addNumbers(
//         addNumbers(ownerPay.toString(), balance.toString()),
//         pay[2].toString(),
//       ).toString(10),
//     );
//     expect(await coterieNftToken.ownerOf(1)).to.eq(other2.address);
//     revertTime(provider);
//     expect(await nftMktplace.admin()).to.eq(wallet.address);
//     expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
//   });
//   it("close bids after due 24 hours erc20", async () => {
//     await paymentToken.transfer(
//       other2.address,
//       expandToEthers(50).toString(10),
//       overrides,
//     );
//     await paymentToken
//       .connect(other2)
//       .approve(nftMktplace.address, expandToEthers(50).toString(10), overrides);
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 1, overrides);
//     const payTo = [{ to: other0.address, percent: "1000" }];
//     await nftMktplace
//       .connect(other0)
//       .createAuction(
//         payTo,
//         coterieNftToken.address,
//         1,
//         expandToEthers(1).toString(10),
//         paymentToken.address,
//         overrides,
//       );
//     await nftMktplace
//       .connect(other2)
//       .makeBid(1, expandToEthers(1.5).toString(10), {
//         ...overrides,
//       });
//     takeSnapshot(provider);
//     await advanceTime(provider, DELAY());
//     const balance = await paymentToken.balanceOf(other0.address);
//     await nftMktplace.connect(other0).closeAuction(1, overrides);
//     const pay = await nftMktplace.viewRoyaltyPayments(
//       coterieNftToken.address,
//       1,
//       expandToEthers(1.5).toString(10),
//     );
//     const ownerPay = await nftMktplace.getOwnerPayment(
//       coterieNftToken.address,
//       1,
//       expandToEthers(1.5).toString(10),
//     );
//     // Royalty goes to same person because he's the original creator
//     expect((await paymentToken.balanceOf(other0.address)).toString()).to.eq(
//       addNumbers(
//         addNumbers(ownerPay.toString(), balance.toString()),
//         pay[2].toString(),
//       ).toString(10),
//     );
//     expect(await coterieNftToken.ownerOf(1)).to.eq(other2.address);
//     revertTime(provider);
//     expect(await nftMktplace.admin()).to.eq(wallet.address);
//     expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
//   });
//   it("allow owner to modify auction", async () => {
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 1, overrides);
//     await coterieNftToken
//       .connect(other0)
//       .mintWithRoyalty(
//         other0.address,
//         stallionMetadataHash,
//         [other0.address],
//         [BigNumber.from(50)],
//         overrides,
//       );
//     await coterieNftToken
//       .connect(other0)
//       .approve(nftMktplace.address, 2, overrides);
//     const payTo = [{ to: other0.address, percent: "1000" }];
//     await nftMktplace
//       .connect(other0)
//       .createAuction(
//         payTo,
//         coterieNftToken.address,
//         1,
//         expandToEthers(1).toString(10),
//         constants.AddressZero,
//         overrides,
//       );
//     await nftMktplace
//       .connect(other0)
//       .createAuction(
//         payTo,
//         coterieNftToken.address,
//         2,
//         expandToEthers(1).toString(10),
//         constants.AddressZero,
//         overrides,
//       );
//     await nftMktplace.makeBid(1, expandToEthers(1.5).toString(10), {
//       ...overrides,
//       value: expandToEthers(1.5).toString(10),
//     });
//     await expect(
//       nftMktplace
//         .connect(other0)
//         .updatePaymentMethod(1, paymentToken.address, overrides),
//     ).to.be.revertedWith("CoterieMarket: only_before_first_bid");
//     await expect(
//       nftMktplace
//         .connect(other0)
//         .updateBasePrice(1, expandToEthers(1.5).toString(10), overrides),
//     ).to.be.revertedWith("CoterieMarket: only_before_first_bid");
//     await expect(
//       nftMktplace.connect(other0).cancelAuction(1, overrides),
//     ).to.be.revertedWith("CoterieMarket: only_before_first_bid");
//     // modify second bid and cancel
//     await nftMktplace
//       .connect(other0)
//       .updatePaymentMethod(2, paymentToken.address, overrides);
//     expect((await nftMktplace.getAuction(2)).paymentMethod).to.eq(
//       paymentToken.address,
//     );
//     await nftMktplace
//       .connect(other0)
//       .updateBasePrice(2, expandToEthers(1.5).toString(10), overrides);
//     expect((await nftMktplace.getAuction(2)).basePrice.toString()).to.eq(
//       expandToEthers(1.5).toString(10),
//     );
//     await nftMktplace.connect(other0).cancelAuction(2, overrides);
//     // enum value for cancelled status is 1
//     expect((await nftMktplace.getAuction(2)).status).to.eq(1);
//     expect(await nftMktplace.admin()).to.eq(wallet.address);
//     expect(await nftMktplace.pendingAdmin()).to.eq(constants.AddressZero);
//   });
// });
