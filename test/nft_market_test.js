const { expect } = require("chai");
const { ethers } = require("hardhat");


//可以通过npx hardhat coverage 查看对应的函数的测试覆盖率
//在 hardhat.config.js 中进行配置 require("solidity-coverage");
describe("NFTMarket TEST ALL", function () {
    let nftMarket;
    beforeEach(async function () {
        let contract = await ethers.getContractFactory("NFTMarketplace");
        nftMarket = await contract.deploy();
        await nftMarket.deployed();
    })

    //1. 测试正常流程
    describe("NFTMarket Normal", function () {
        

        it("create token return tokenId", async function () {

            const [signer1] = await ethers.getSigners();

            let listPrice = await nftMarket.getListPrice();
            //create token
            await nftMarket.createToken("/uri", 5, { value: listPrice });

            let lastedId = await nftMarket.getLastIdToListedToken();
            expect(lastedId).eq(1);
            let listedToken = await nftMarket.getListedTokenForId(lastedId);
            expect(listedToken.price).eq(5);
            expect(listedToken.seller).eq(await signer1.getAddress());
        });
        it("create token tokenId incr", async function () {

            const [signer1] = await ethers.getSigners();

            let listPrice = await nftMarket.getListPrice();
            //create token
            await nftMarket.createToken("/uri", 5, { value: listPrice });
            await nftMarket.createToken("/uri", 5, { value: listPrice });
            let lastedId = await nftMarket.getLastIdToListedToken();
            expect(lastedId).eq(2);
        });

        it("create token executeSale", async function () {

            const [signer1, signer2] = await ethers.getSigners();

            let listPrice = await nftMarket.getListPrice();
            //create token
            await nftMarket.createToken("/uri", 5, { value: listPrice });

            let lastedId = await nftMarket.getLastIdToListedToken();

            let listedToken = await  nftMarket.getListedTokenForId(1);

            await nftMarket.connect(signer2).executeSale(1, { value: listedToken.price });
            listedToken =await nftMarket.getListedTokenForId(1);

            expect(listedToken.seller).eq(await signer2.getAddress());

            expect(listedToken.owner).eq(nftMarket.address);

            expect(await nftMarket.ownerOf(1)).eq(await signer2.getAddress());

        });
    })

    //2. 测试异常流程
    describe("NFTMarket Exception", function () {
        it("create token return tokenId", async function () {

            const [signer1] = await ethers.getSigners();

            let listPrice = await nftMarket.getListPrice();
            //create token
            await expect(nftMarket.createToken("/uri", 5)).revertedWith(
                "must pay for listing"
            );
        });
        it("create token price must greater than zero", async function () {

            const [signer1] = await ethers.getSigners();

            let listPrice = await nftMarket.getListPrice();
            //create token
            await expect(nftMarket.createToken("/uri", 0, { value: listPrice })).revertedWith(
                "price must greater than zero"
            );
        });

        it("create token executeSale not enough", async function () {

            const [signer1, signer2] = await ethers.getSigners();

            let listPrice = await nftMarket.getListPrice();
            //create token
            await nftMarket.createToken("/uri", 5, { value: listPrice });

            let lastedId = await nftMarket.getLastIdToListedToken();

            let listedToken = await  nftMarket.getListedTokenForId(1);

            await expect(nftMarket.connect(signer2).executeSale(1, { value:1 }))
            .revertedWith("value not enough");
        });
    })

    //3. 测试辅助流
    describe("NFTMarketplace Helper", function(){
        it("list all nft",async function(){
            const [signer1, signer2] = await ethers.getSigners();
            let listPrice = await nftMarket.getListPrice();
            // 创建第一个
            await nftMarket.createToken("/nft1", 5, { value: listPrice });
            // 创建第二个的
            await nftMarket.createToken("/nft2", 2, { value: listPrice });

            // 创建第三个
            await nftMarket.connect(signer2).createToken("/nft3", 5, { value: listPrice });

            const all_nft= await nftMarket.getAllNFTs();
            expect(all_nft.length).eq(3);
        });

        it("list my nft",async function(){
            const [signer1, signer2] = await ethers.getSigners();
            let listPrice = await nftMarket.getListPrice();
            // 创建第一个
            await nftMarket.createToken("/nft1", 5, { value: listPrice });
            // 创建第二个的
            await nftMarket.createToken("/nft2", 2, { value: listPrice });

            // 创建第三个
            await nftMarket.connect(signer2).createToken("/nft3", 5, { value: listPrice });

            const my_nft= await nftMarket.getMyNFTs();
            expect(my_nft.length).eq(2);
        });
    })

})

