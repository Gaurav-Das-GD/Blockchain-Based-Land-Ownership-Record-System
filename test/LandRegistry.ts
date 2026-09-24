import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("LandRegistry", function () {
  let landRegistry: any;
  let admin: any;
  let inspector: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [admin, inspector, user1, user2] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
  });

  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      expect(await landRegistry.admin()).to.equal(admin.address);
    });

    it("Should check admin correctly", async function () {
      expect(await landRegistry.isAdmin(admin.address)).to.equal(true);
      expect(await landRegistry.isAdmin(user1.address)).to.equal(false);
    });
  });

  describe("Inspector Management", function () {
    it("Admin should add an inspector", async function () {
      await landRegistry.addLandInspector(inspector.address);
      expect(await landRegistry.isLandInspector(inspector.address)).to.equal(true);
    });

    it("Non-admin should NOT add an inspector", async function () {
      await expect(
        landRegistry.connect(user1).addLandInspector(inspector.address)
      ).to.be.revertedWith("Only admin can perform this");
    });

    it("Admin should remove an inspector", async function () {
      await landRegistry.addLandInspector(inspector.address);
      await landRegistry.removeLandInspector(inspector.address);
      expect(await landRegistry.isLandInspector(inspector.address)).to.equal(false);
    });
  });

  describe("User Registration", function () {
    it("Should register a new user", async function () {
      await landRegistry.connect(user1).registerUser(
        "Gaurav Das", 22, "Kolkata", "1234-5678-9012",
        "gaurav@email.com", "9876543210", "profileHash", "docHash"
      );
      const user = await landRegistry.getUserDetails(user1.address);
      expect(user.name).to.equal("Gaurav Das");
      expect(user.isVerified).to.equal(false);
    });

    it("Should NOT register same user twice", async function () {
      await landRegistry.connect(user1).registerUser(
        "Gaurav Das", 22, "Kolkata", "1234-5678-9012",
        "gaurav@email.com", "9876543210", "profileHash", "docHash"
      );
      await expect(
        landRegistry.connect(user1).registerUser(
          "Gaurav Das", 22, "Kolkata", "1234-5678-9012",
          "gaurav@email.com", "9876543210", "profileHash", "docHash"
        )
      ).to.be.revertedWith("User already registered");
    });
  });

  describe("User Verification", function () {
    beforeEach(async function () {
      await landRegistry.addLandInspector(inspector.address);
      await landRegistry.connect(user1).registerUser(
        "Gaurav Das", 22, "Kolkata", "1234-5678-9012",
        "gaurav@email.com", "9876543210", "profileHash", "docHash"
      );
    });

    it("Inspector should verify a user", async function () {
      await landRegistry.connect(inspector).verifyUser(user1.address);
      expect(await landRegistry.isUserVerified(user1.address)).to.equal(true);
    });

    it("Non-inspector should NOT verify a user", async function () {
      await expect(
        landRegistry.connect(user2).verifyUser(user1.address)
      ).to.be.revertedWith("Only inspector can perform this");
    });
  });

  describe("Land Registration", function () {
    it("Admin should register land", async function () {
      await landRegistry.registerLand(
        user1.address, "Kolkata Ward 45", "Kolkata",
        1200, ethers.parseEther("2.5"), "landDocHash", "PROP-001"
      );
      const land = await landRegistry.getLandDetails(1);
      expect(land.location).to.equal("Kolkata Ward 45");
      expect(land.owner).to.equal(user1.address);
    });

    it("Non-admin should NOT register land", async function () {
      await expect(
        landRegistry.connect(user1).registerLand(
          user1.address, "Kolkata Ward 45", "Kolkata",
          1200, ethers.parseEther("2.5"), "landDocHash", "PROP-001"
        )
      ).to.be.revertedWith("Only admin can perform this");
    });

    it("Should track user's lands", async function () {
      await landRegistry.registerLand(
        user1.address, "Plot A", "Delhi",
        1000, ethers.parseEther("1"), "hash1", "PROP-001"
      );
      await landRegistry.registerLand(
        user1.address, "Plot B", "Mumbai",
        2000, ethers.parseEther("3"), "hash2", "PROP-002"
      );
      const lands = await landRegistry.getUserLands(user1.address);
      expect(lands.length).to.equal(2);
    });
  });

  describe("Land Sale", function () {
    beforeEach(async function () {
      await landRegistry.addLandInspector(inspector.address);
      await landRegistry.connect(user1).registerUser(
        "Gaurav Das", 22, "Kolkata", "1234-5678-9012",
        "gaurav@email.com", "9876543210", "profileHash", "docHash"
      );
      await landRegistry.connect(inspector).verifyUser(user1.address);
      await landRegistry.registerLand(
        user1.address, "Kolkata Ward 45", "Kolkata",
        1200, ethers.parseEther("2.5"), "landDocHash", "PROP-001"
      );
      await landRegistry.connect(inspector).verifyLand(1);
    });

    it("Owner should put land for sale", async function () {
      await landRegistry.connect(user1).putLandForSale(1, ethers.parseEther("3"));
      const land = await landRegistry.getLandDetails(1);
      expect(land.isForSale).to.equal(true);
    });

    it("Owner should remove land from sale", async function () {
      await landRegistry.connect(user1).putLandForSale(1, ethers.parseEther("3"));
      await landRegistry.connect(user1).removeLandFromSale(1);
      const land = await landRegistry.getLandDetails(1);
      expect(land.isForSale).to.equal(false);
    });

    it("Non-owner should NOT put land for sale", async function () {
      await landRegistry.connect(user2).registerUser(
        "Priya Sen", 25, "Mumbai", "9999-8888-7777",
        "priya@email.com", "1234567890", "profileHash2", "docHash2"
      );
      await landRegistry.connect(inspector).verifyUser(user2.address);
      await expect(
        landRegistry.connect(user2).putLandForSale(1, ethers.parseEther("3"))
      ).to.be.revertedWith("You don't own this land");
    });
  });

  describe("Buy Land", function () {
    beforeEach(async function () {
      await landRegistry.addLandInspector(inspector.address);
      await landRegistry.connect(user1).registerUser(
        "Gaurav Das", 22, "Kolkata", "1234-5678-9012",
        "gaurav@email.com", "9876543210", "profileHash", "docHash"
      );
      await landRegistry.connect(inspector).verifyUser(user1.address);
      await landRegistry.connect(user2).registerUser(
        "Priya Sen", 25, "Mumbai", "9999-8888-7777",
        "priya@email.com", "1234567890", "profileHash2", "docHash2"
      );
      await landRegistry.connect(inspector).verifyUser(user2.address);
      await landRegistry.registerLand(
        user1.address, "Kolkata Ward 45", "Kolkata",
        1200, ethers.parseEther("2"), "landDocHash", "PROP-001"
      );
      await landRegistry.connect(inspector).verifyLand(1);
      await landRegistry.connect(user1).putLandForSale(1, ethers.parseEther("2"));
    });

    it("Verified user should buy land", async function () {
      await landRegistry.connect(user2).buyLand(1, {
        value: ethers.parseEther("2"),
      });
      expect(await landRegistry.transferCount()).to.equal(1);
    });

    it("Should NOT buy land with insufficient payment", async function () {
      await expect(
        landRegistry.connect(user2).buyLand(1, {
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWith("Insufficient payment");
    });
  });
});