const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainPay", function () {
  let chainPay;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    const ChainPay = await ethers.getContractFactory("ChainPay");
    chainPay = await ChainPay.deploy();
    await chainPay.waitForDeployment();
  });

  describe("Deposit", function () {
    it("Should deposit funds successfully", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await expect(chainPay.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(chainPay, "Deposit")
        .withArgs(addr1.address, depositAmount, (value) => typeof value === "bigint" && value > 0);
      
      const balance = await chainPay.getBalance(addr1.address);
      expect(balance).to.equal(depositAmount);
    });

    it("Should reject deposit with zero amount", async function () {
      await expect(
        chainPay.connect(addr1).deposit({ value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Send Payment", function () {
    beforeEach(async function () {
      // Deposit funds for addr1
      await chainPay.connect(addr1).deposit({ value: ethers.parseEther("10.0") });
    });

    it("Should send payment successfully", async function () {
      const paymentAmount = ethers.parseEther("1.0");
      
      await expect(chainPay.connect(addr1).sendPayment(addr2.address, paymentAmount))
        .to.emit(chainPay, "PaymentSent")
        .withArgs(
          addr1.address,
          addr2.address,
          paymentAmount,
          (value) => typeof value === "bigint" && value > 0,
          (value) => typeof value === "string" && value.length > 0
        );
      
      const balance1 = await chainPay.getBalance(addr1.address);
      const balance2 = await chainPay.getBalance(addr2.address);
      
      expect(balance1).to.equal(ethers.parseEther("9.0"));
      expect(balance2).to.equal(paymentAmount);
    });

    it("Should reject payment with insufficient balance", async function () {
      const paymentAmount = ethers.parseEther("20.0");
      
      await expect(
        chainPay.connect(addr1).sendPayment(addr2.address, paymentAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should reject payment to invalid address (zero address)", async function () {
      const paymentAmount = ethers.parseEther("1.0");
      
      await expect(
        chainPay.connect(addr1).sendPayment(ethers.ZeroAddress, paymentAmount)
      ).to.be.revertedWith("Invalid recipient address");
    });

    it("Should reject payment to sender address", async function () {
      const paymentAmount = ethers.parseEther("1.0");
      
      await expect(
        chainPay.connect(addr1).sendPayment(addr1.address, paymentAmount)
      ).to.be.revertedWith("Cannot send to yourself");
    });

    it("Should reject payment with zero amount", async function () {
      await expect(
        chainPay.connect(addr1).sendPayment(addr2.address, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Get Balance", function () {
    it("Should return correct balance", async function () {
      const depositAmount = ethers.parseEther("5.0");
      await chainPay.connect(addr1).deposit({ value: depositAmount });
      
      const balance = await chainPay.getBalance(addr1.address);
      expect(balance).to.equal(depositAmount);
      
      const myBalance = await chainPay.connect(addr1).myBalance();
      expect(myBalance).to.equal(depositAmount);
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await chainPay.connect(addr1).deposit({ value: ethers.parseEther("10.0") });
    });

    it("Should withdraw funds successfully", async function () {
      const withdrawAmount = ethers.parseEther("3.0");
      const initialBalance = await ethers.provider.getBalance(addr1.address);
      
      const tx = await chainPay.connect(addr1).withdraw(withdrawAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      const contractBalance = await chainPay.getBalance(addr1.address);
      
      expect(finalBalance).to.equal(initialBalance + withdrawAmount - gasUsed);
      expect(contractBalance).to.equal(ethers.parseEther("7.0"));
    });

    it("Should reject withdrawal with insufficient balance", async function () {
      const withdrawAmount = ethers.parseEther("20.0");
      
      await expect(
        chainPay.connect(addr1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});