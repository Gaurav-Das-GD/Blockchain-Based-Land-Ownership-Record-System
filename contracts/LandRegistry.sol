// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LandRegistry {
    address public admin;
    uint public landCount = 0;
    uint public transferCount = 0;

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

    struct TransferRequest {
        uint id;
        uint landId;
        address fromAddress;
        address toAddress;
        uint price;
        bool sellerApproved;
        bool buyerApproved;
        bool inspectorApproved;
        bool isCompleted;
    }

    // ===== MAPPINGS =====
    mapping(address => User) public users;
    mapping(uint => Land) public lands;
    mapping(address => bool) public landInspectors;
    mapping(address => uint[]) public landsOfOwner;
    mapping(uint => TransferRequest) public transferRequests;

    // ===== EVENTS =====
    event UserRegistered(address indexed user, string name);
    event UserVerified(address indexed user, address indexed inspector);
    event UserRejected(address indexed user, address indexed inspector);
    event LandRegistered(uint indexed landId, address indexed owner, string location);
    event LandVerified(uint indexed landId, address indexed inspector);
    event LandForSale(uint indexed landId, uint price);
    event LandRemovedFromSale(uint indexed landId);
    event TransferRequested(uint indexed requestId, uint landId, address from, address to);
    event TransferApproved(uint indexed requestId, address indexed inspector);
    event TransferCompleted(uint indexed requestId, uint landId, address from, address to);
    event InspectorAdded(address indexed inspector);
    event InspectorRemoved(address indexed inspector);

    // ===== MODIFIERS =====
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this");
        _;
    }

    modifier onlyInspector() {
        require(landInspectors[msg.sender], "Only inspector can perform this");
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

    function removeLandInspector(address _inspector) public onlyAdmin {
        landInspectors[_inspector] = false;
        emit InspectorRemoved(_inspector);
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

    // ===== INSPECTOR FUNCTIONS =====
    function verifyUser(address _user) public onlyInspector {
        require(users[_user].exists, "User does not exist");
        users[_user].isVerified = true;
        emit UserVerified(_user, msg.sender);
    }

    function rejectUser(address _user) public onlyInspector {
        require(users[_user].exists, "User does not exist");
        users[_user].isVerified = false;
        emit UserRejected(_user, msg.sender);
    }

    function verifyLand(uint _landId) public onlyInspector {
        require(lands[_landId].exists, "Land does not exist");
        lands[_landId].isVerified = true;
        emit LandVerified(_landId, msg.sender);
    }

    function approveTransfer(uint _requestId) public onlyInspector {
        TransferRequest storage req = transferRequests[_requestId];
        require(!req.isCompleted, "Transfer already completed");
        require(req.sellerApproved && req.buyerApproved, "Both parties must accept first");

        req.inspectorApproved = true;
        req.isCompleted = true;

        // Transfer ownership
        lands[req.landId].owner = req.toAddress;
        lands[req.landId].isForSale = false;

        // Update landsOfOwner
        _removeLandFromOwner(req.fromAddress, req.landId);
        landsOfOwner[req.toAddress].push(req.landId);

        emit TransferApproved(_requestId, msg.sender);
        emit TransferCompleted(_requestId, req.landId, req.fromAddress, req.toAddress);
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

    function putLandForSale(uint _landId, uint _price) public onlyVerifiedUser {
        require(lands[_landId].owner == msg.sender, "You don't own this land");
        require(lands[_landId].isVerified, "Land not verified");
        lands[_landId].isForSale = true;
        lands[_landId].price = _price;
        emit LandForSale(_landId, _price);
    }

    function removeLandFromSale(uint _landId) public onlyVerifiedUser {
        require(lands[_landId].owner == msg.sender, "You don't own this land");
        lands[_landId].isForSale = false;
        emit LandRemovedFromSale(_landId);
    }

    function requestTransfer(uint _landId, address _toAddress) public onlyVerifiedUser {
        require(lands[_landId].owner == msg.sender, "You don't own this land");
        require(users[_toAddress].isVerified, "Recipient not verified");

        transferCount++;
        transferRequests[transferCount] = TransferRequest(
            transferCount, _landId, msg.sender, _toAddress,
            lands[_landId].price, true, false, false, false
        );
        emit TransferRequested(transferCount, _landId, msg.sender, _toAddress);
    }

    function acceptTransfer(uint _requestId) public onlyVerifiedUser {
        TransferRequest storage req = transferRequests[_requestId];
        require(req.toAddress == msg.sender, "Not your transfer request");
        require(!req.isCompleted, "Transfer already completed");
        req.buyerApproved = true;
    }

    function rejectTransfer(uint _requestId) public onlyVerifiedUser {
        TransferRequest storage req = transferRequests[_requestId];
        require(
            req.toAddress == msg.sender || req.fromAddress == msg.sender,
            "Not your transfer request"
        );
        req.isCompleted = true;
    }

    function buyLand(uint _landId) public payable onlyVerifiedUser {
        require(lands[_landId].isForSale, "Land not for sale");
        require(msg.value >= lands[_landId].price, "Insufficient payment");
        require(lands[_landId].owner != msg.sender, "You already own this land");

        address previousOwner = lands[_landId].owner;

        transferCount++;
        transferRequests[transferCount] = TransferRequest(
            transferCount, _landId, previousOwner, msg.sender,
            msg.value, true, true, false, false
        );

        // Send payment to seller
        payable(previousOwner).transfer(msg.value);

        emit TransferRequested(transferCount, _landId, previousOwner, msg.sender);
    }

    // ===== VIEW FUNCTIONS =====
    function getLandDetails(uint _landId) public view returns (Land memory) {
        require(lands[_landId].exists, "Land does not exist");
        return lands[_landId];
    }

    function getUserDetails(address _user) public view returns (User memory) {
        require(users[_user].exists, "User does not exist");
        return users[_user];
    }

    function getUserLands(address _user) public view returns (uint[] memory) {
        return landsOfOwner[_user];
    }

    function isLandInspector(address _addr) public view returns (bool) {
        return landInspectors[_addr];
    }

    function isUserVerified(address _addr) public view returns (bool) {
        return users[_addr].isVerified;
    }

    function isAdmin(address _addr) public view returns (bool) {
        return _addr == admin;
    }

    // ===== INTERNAL HELPER =====
    function _removeLandFromOwner(address _owner, uint _landId) internal {
        uint[] storage ownerLands = landsOfOwner[_owner];
        for (uint i = 0; i < ownerLands.length; i++) {
            if (ownerLands[i] == _landId) {
                ownerLands[i] = ownerLands[ownerLands.length - 1];
                ownerLands.pop();
                break;
            }
        }
    }
}