const chai = require("chai");
const { BigNumber, Contract } = require("ethers");
const { solidity, MockProvider } = require("ethereum-waffle");

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
const [wallet, other0, other1, other2, other3, other4, other5, other6] =
  accounts;

const stallionMetadataHash = "QmPMzRbSmpYdhNfoLatxY4JBwTBD1kCjSdrr86rxYUdRXk";

const dolphinMetadataHash = "QmbCLTJQpd3o3vPpTo1RzcxL6RB9gsZFjxgjUwvpXXJcLS";

const unicornMetadataHash = "QmNZYxgXThVB4mw2f6dD8UF2mxNvRbupnxwqfkXMbgHj9o";

const zebraUnicornMetadataHash =
  "QmcAaZmBmzgVngHVHJc6nUgtkHGhRiX6L4ofvjupGn6YPT";

const albinoGorillaMetadataHash =
  "QmS7r1t5SEQm8hPAZGkU7rf9mVnpYvfy2Q16SE1FUgLFja";

const diamondMetadataHash = "QmdAQnWcLKEaZdCrQm8ssEcr7T3fkPK8Bj7NGwobd3Vmtx";
let delfyNftToken;
beforeEach(async () => {
  const DelfyNftToken = await ethers.getContractFactory("DelfyNFT", wallet);
  delfyNftToken = await DelfyNftToken.deploy();
});

const advanceBlock = async (times) => {
  for (let i = 0; i < times; i++) {
    await provider.send("evm_mine");
  }
};
describe("Nft ", () => {
  it("deploys", async () => {
    expect(await delfyNftToken.owner()).to.eq(wallet.address);
  });
  it("adds minter", async () => {
    await delfyNftToken.connect(wallet).addMinter(other0.address, overrides);
    expect(await delfyNftToken.isMinter(other0.address)).to.be.true;
    await expect(
      delfyNftToken.connect(other0).addMinter(other0.address, overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await delfyNftToken
      .connect(other0)
      .registerNewMinter(other1.address, overrides);
    expect(await delfyNftToken.isMinter(other1.address)).to.be.true;
  });
  it("restrict and restores minter", async () => {
    await delfyNftToken.connect(wallet).addMinter(other0.address, overrides);
    expect(await delfyNftToken.isMinter(other0.address)).to.be.true;
    await expect(
      delfyNftToken.connect(other1).restrictMinter(other0.address, overrides),
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await delfyNftToken
      .connect(wallet)
      .restrictMinter(other0.address, overrides);
    expect(await delfyNftToken.isMinter(other0.address)).to.be.false;
    await delfyNftToken
      .connect(wallet)
      .restoreMinter(other0.address, overrides);
    expect(await delfyNftToken.isMinter(other0.address)).to.be.true;
  });
  it("mints", async () => {
    await delfyNftToken.connect(wallet).addMinter(other0.address, overrides);
    await delfyNftToken
      .connect(other0)
      .mint(
        other0.address,
        stallionMetadataHash,
        [other0.address],
        [0.5 * 10000],
        overrides,
      );
    expect(await delfyNftToken.totalSupply()).to.eq(BigNumber.from(1));
    expect(await delfyNftToken.balanceOf(other0.address)).to.eq(
      BigNumber.from(1),
    );
    expect(await delfyNftToken.isRoyalty(other0.address, 1)).to.be.true;
    const royaltys = await delfyNftToken.getRoyalties(1);
    console.log(royaltys);
    expect(royaltys[0][0]).to.eq(other0.address);
    expect(royaltys[1][0]).to.eq(BigNumber.from(5000));
    expect(royaltys[0].length).to.eq(BigNumber.from(1));
    expect(royaltys[1].length).to.eq(BigNumber.from(1));
  });
  it("verify mint args", async () => {
    await delfyNftToken.connect(wallet).addMinter(other0.address, overrides);
    await expect(
      delfyNftToken
        .connect(other0)
        .mint(
          other0.address,
          stallionMetadataHash,
          [other0.address],
          [BigNumber.from(5000), BigNumber.from(5000)],
          overrides,
        ),
    ).to.be.revertedWith("DelfyNFT: unequal array length");
    await expect(
      delfyNftToken
        .connect(other0)
        .mint(
          other0.address,
          stallionMetadataHash,
          [other0.address, other1.address],
          [BigNumber.from(5000)],
          overrides,
        ),
    ).to.be.revertedWith("DelfyNFT: unequal array length");
    await expect(
      delfyNftToken
        .connect(other0)
        .mint(
          other0.address,
          stallionMetadataHash,
          [other0.address, other1.address],
          [BigNumber.from(5000), BigNumber.from(1000000)],
          overrides,
        ),
    ).to.be.revertedWith("DelfyNFT:royalty cannot be greater than 100%");
  });
  it("burn", async () => {
    await delfyNftToken.connect(wallet).addMinter(other0.address, overrides);
    await delfyNftToken
      .connect(other0)
      .mint(
        other0.address,
        stallionMetadataHash,
        [other0.address],
        [BigNumber.from(5000)],
        overrides,
      );
    await delfyNftToken
      .connect(other0)
      .transferFrom(other0.address, other1.address, 1, overrides);
    await expect(
      delfyNftToken.connect(other0).burn(1, overrides),
    ).to.be.revertedWith("ERC721: only creator as the current owner");
    await expect(
      delfyNftToken.connect(other1).burn(1, overrides),
    ).to.be.revertedWith("ERC721: only creator as the current owner");
    await delfyNftToken
      .connect(other1)
      .transferFrom(other1.address, other0.address, 1, overrides);
    await delfyNftToken.connect(other0).burn(1, overrides);
    expect(await delfyNftToken.totalSupply()).to.eq(0);
  });
  it("sets royalty", async () => {
    await delfyNftToken.connect(wallet).addMinter(other0.address, overrides);
    await delfyNftToken
      .connect(other0)
      .mint(
        other0.address,
        stallionMetadataHash,
        [other0.address],
        [BigNumber.from(5000)],
        overrides,
      );
    await delfyNftToken
      .connect(other0)
      .transferFrom(other0.address, other1.address, 1, overrides);
    await expect(
      delfyNftToken
        .connect(other0)
        .updateRoyalty(
          1,
          [other0.address, other1.address],
          [BigNumber.from(5000), BigNumber.from(5000)],
          overrides,
        ),
    ).to.be.revertedWith("ERC721: only creator as the current owner");
    await delfyNftToken
      .connect(other1)
      .transferFrom(other1.address, other0.address, 1, overrides);
    await expect(
      delfyNftToken
        .connect(other0)
        .updateRoyalty(
          1,
          [other0.address],
          [BigNumber.from(5000), BigNumber.from(5000)],
          overrides,
        ),
    ).to.be.revertedWith("DelfyNFT: unequal array length");
    await expect(
      delfyNftToken
        .connect(other0)
        .updateRoyalty(
          1,
          [other0.address],
          [BigNumber.from(1005000)],
          overrides,
        ),
    ).to.be.revertedWith("DelfyNFT:royalty cannot be greater than 100%");
    await delfyNftToken
      .connect(other0)
      .updateRoyalty(1, [other0.address], [BigNumber.from(5000)], overrides);
    const rties = await delfyNftToken.getRoyalties(1);
    expect(rties[0].length).to.eq(1);
    expect(rties[1].length).to.eq(1);
  });
});
