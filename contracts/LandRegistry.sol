// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LandRegistry {
    address public admin;
    uint public landCount = 0;

    // ===== STRUCTS =====
    struct User {
        address walletAddress;
        string name;
        uint age;
        string city;
        string aadhaarNumber;
        string email;
        string phone;
        string profileHash;
        string documentHash;
        bool isVerified;
        bool exists;
    }

    struct Land {
        uint id;
        address owner;
        string location;
        string city;
        uint area;
        uint price;
        string documentHash;
        string propertyId;
        bool isVerified;
        bool isForSale;
        bool exists;
    }

    // ===== MAPPINGS =====
    mapping(address => User) public users;
    mapping(uint => Land) public lands;
    mapping(address => bool) public landInspectors;
    mapping(address => uint[]) public landsOfOwner;

    // ===== EVENTS =====
    event UserRegistered(address indexed user, string name);
    event LandRegistered(uint indexed landId, address indexed owner, string location);
    event InspectorAdded(address indexed inspector);

    // ===== MODIFIERS =====
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this");
        _;
    }

    modifier onlyVerifiedUser() {
        require(users[msg.sender].isVerified, "User not verified");
        _;
    }

    // ===== CONSTRUCTOR =====
    constructor() {
        admin = msg.sender;
    }

    // ===== ADMIN FUNCTIONS =====
    function addLandInspector(address _inspector) public onlyAdmin {
        landInspectors[_inspector] = true;
        emit InspectorAdded(_inspector);
    }

    function registerLand(
        address _owner,
        string memory _location,
        string memory _city,
        uint _area,
        uint _price,
        string memory _documentHash,
        string memory _propertyId
    ) public onlyAdmin {
        landCount++;
        lands[landCount] = Land(
            landCount, _owner, _location, _city,
            _area, _price, _documentHash, _propertyId,
            false, false, true
        );
        landsOfOwner[_owner].push(landCount);
        emit LandRegistered(landCount, _owner, _location);
    }

    // ===== USER FUNCTIONS =====
    function registerUser(
        string memory _name,
        uint _age,
        string memory _city,
        string memory _aadhaarNumber,
        string memory _email,
        string memory _phone,
        string memory _profileHash,
        string memory _documentHash
    ) public {
        require(!users[msg.sender].exists, "User already registered");
        users[msg.sender] = User(
            msg.sender, _name, _age, _city,
            _aadhaarNumber, _email, _phone,
            _profileHash, _documentHash,
            false, true
        );
        emit UserRegistered(msg.sender, _name);
    }
}