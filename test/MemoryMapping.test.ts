import { assert, expect } from 'chai';
import { ethers } from 'hardhat';

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe('MemoryMapping', async () => {
    async function deployMemoryMappingFixture() {
        const [uploader1, uploader2] = await ethers.getSigners();
        const contract = await ethers.deployContract("MemoryMapping");

        await contract.waitForDeployment();

        return { contract, uploader1, uploader2 };
    }

    it('should memory amount uploaded correctly', async () => {
        const { contract, uploader1, uploader2 } = await loadFixture(deployMemoryMappingFixture);

        await contract.connect(uploader1).addMemory("testMemory1", "testArweave1", "0 ETH");
        await contract.connect(uploader2).addMemory("testMemory2", "testArweave2", "1 ETH");

        const memoriesAmount = await contract.getMemoriesAmount();
        assert.equal(memoriesAmount, 2n, "The memories amount should be 2");
    });

    it('should latest memories updated correctly', async () => {
        const { contract, uploader1, uploader2 } = await loadFixture(deployMemoryMappingFixture);

        await contract.connect(uploader1).addMemory("testMemoryId1", "testDescription1", "0 ETH");
        await contract.connect(uploader2).addMemory("testMemoryId2", "testDescription2", "1 ETH");

        const latestMemories = await contract.getLatestMemories();
        assert.equal(latestMemories.length, 2, "The latest memories amount should be 2");

        assert.equal(latestMemories[0].memoryId, "testMemoryId1", "The arweave tx id of 1st latest memory should be 'testMemoryId1'");
        assert.equal(latestMemories[0].price, "0 ETH", "The price of 1st latest memory should be 0 ETH");
        assert.equal(latestMemories[0].description, "testDescription1", "The description of 1st latest memory should be 'testDescription1'");
        assert.equal(latestMemories[0].uploader, uploader1.address, "The uploader of 1st latest memory should be uploader1");

        assert.equal(latestMemories[1].memoryId, "testMemoryId2", "The arweave tx id of 2nd latest memory should be 'testMemoryId2'");
        assert.equal(latestMemories[1].price, "1 ETH", "The price of 2nd latest memory should be 1 ETH");
        assert.equal(latestMemories[1].description, "testDescription2", "The description of 2nd latest memory should be 'testDescription2'");
        assert.equal(latestMemories[1].uploader, uploader2.address, "The uploader of 2nd latest memory should be uploader2");
    });

    it('should memory after 30 overwrite latest memories correctly', async () => {
        const { contract, uploader1, uploader2 } = await loadFixture(deployMemoryMappingFixture);

        // Add 33 memories
        for (let i = 0; i < 33; i++) {
            await contract.connect(i % 2 == 0 ? uploader1 : uploader2).addMemory(`testMemoryId${i + 1}`, `testDescription${i + 1}`, `${i} ETH`);
        }

        expect(await contract.getUsersAmount()).to.equal(2);
        expect(await contract.getMemoriesAmount()).to.equal(33);

        const latestMemories = await contract.getLatestMemories();
        assert.equal(latestMemories[0].memoryId, "testMemoryId31", "The arweave tx id of 1st latest memory should be 'testMemoryId31'");
        assert.equal(latestMemories[0].price, "30 ETH", "The price of 1st latest memory should be 30 ETH");
        assert.equal(latestMemories[0].description, "testDescription31", "The description of 1st latest memory should be 'testDescription31'");

        assert.equal(latestMemories[1].memoryId, "testMemoryId32", "The arweave tx id of 2nd latest memory should be 'testMemoryId32'");
        assert.equal(latestMemories[1].price, "31 ETH", "The price of 2nd latest memory should be 31 ETH");
        assert.equal(latestMemories[1].description, "testDescription32", "The description of 2nd latest memory should be 'testDescription32'");

        assert.equal(latestMemories[2].memoryId, "testMemoryId33", "The arweave tx id of 3rd latest memory should be 'testMemoryId33'");
        assert.equal(latestMemories[2].price, "32 ETH", "The price of 3rd latest memory should be 32 ETH");
        assert.equal(latestMemories[2].description, "testDescription33", "The description of 3rd latest memory should be 'testDescription33'");
    });

    it("should user memories updated correctly", async () => {
        const { contract, uploader1, uploader2 } = await loadFixture(deployMemoryMappingFixture);

        // Add a memory use uploader1
        await contract.connect(uploader1).addMemory("testMemoryId1", "testDescription1", "0 ETH");
        expect(await contract.getUsersAmount()).to.equal(1);

        // Add a memory use uploader2
        await contract.connect(uploader2).addMemory("testMemoryId2", "testDescription2", "1 ETH");
        await contract.connect(uploader2).addMemory("testMemoryId3", "testDescription3", "2 ETH");
        expect(await contract.getUsersAmount()).to.equal(2);

        expect(await contract.getUserMemoryAmount(uploader1.address)).to.equal(1);
        expect(await contract.getUserMemoryAmount(uploader2.address)).to.equal(2);

        const memoriesOfUploader1 = await contract.getUserMemories(uploader1.address);

        assert.equal(memoriesOfUploader1.length, 1, "The memories list length of uploader1 should be 1");
        assert.equal(memoriesOfUploader1[0].memoryId, "testMemoryId1", "The arweave tx id of uploader1's memory should be 'testMemoryId1'");
        assert.equal(memoriesOfUploader1[0].price, "0 ETH", "The price of uploader1's memory should be 0 ETH");
        assert.equal(memoriesOfUploader1[0].description, "testDescription1", "The description of uploader1's memory should be 'testDescription1'");

        const memoriesOfUploader2 = await contract.getUserMemories(uploader2.address);

        assert.equal(memoriesOfUploader2.length, 2, "The memories list length of uploader2 should be 2");
        assert.equal(memoriesOfUploader2[0].memoryId, "testMemoryId2", "The arweave tx id of uploader2's memory should be 'testMemoryId2'");
        assert.equal(memoriesOfUploader2[0].price, "1 ETH", "The price of uploader2's memory should be 1 ETH");
        assert.equal(memoriesOfUploader2[0].description, "testDescription2", "The description of uploader2's memory should be 'testDescription2'");
        assert.equal(memoriesOfUploader2[1].memoryId, "testMemoryId3", "The arweave tx id of uploader2's second memory should be 'testMemoryId3'");
        assert.equal(memoriesOfUploader2[1].price, "2 ETH", "The price of uploader2's second memory should be 2 ETH");
        assert.equal(memoriesOfUploader2[1].description, "testDescription3", "The description of uploader2's second memory should be 'testDescription3'");
    });
});