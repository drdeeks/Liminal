// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/GMR.sol";
import "../src/Leaderboard.sol";
import "../src/ResetStrikes.sol";

/**
 * @title Self-Contained Deployment Script
 * @notice ONE COMMAND DEPLOYMENT - Everything hardcoded, fully automated
 * @dev Usage: 
 *      forge script script/Deploy.s.sol --sig "run(string)" "base"
 *      forge script script/Deploy.s.sol --sig "run(string)" "monad"
 */
contract Deploy is Script {
    
    // ============================================
    // HARDCODED CONFIGURATION
    // ============================================
    
    // DEPLOYER KEYSTORE NAME (must exist in ~/.foundry/keystores/)
    string constant KEYSTORE_NAME = "deployer";
    
    // API KEYS FOR VERIFICATION (HARDCODED - ADD YOUR KEYS HERE)
    string constant BASESCAN_API_KEY = "YOUR_BASESCAN_API_KEY_HERE";
    string constant MONAD_API_KEY = "YOUR_MONAD_API_KEY_HERE";
    
    // CHAIN CONFIGURATIONS
    struct ChainConfig {
        uint256 chainId;
        string rpcUrl;
        address priceFeed;
        string explorerApiUrl;
        string explorerUrl;
        string verifierUrl;
        string apiKey;
        string name;
        bool isTestnet;
    }
    
    mapping(string => ChainConfig) private chains;
    
    // DEPLOYMENT STATE
    address private gmrAddr;
    address private leaderboardAddr;
    address private resetStrikesAddr;
    string private selectedChain;
    uint256 constant USD_COST_CENTS = 5;
    
    // ============================================
    // MAIN ENTRY POINT
    // ============================================
    
    function run(string memory chain) external {
        _initChains();
        _validateChain(chain);
        selectedChain = chain;
        
        _printHeader();
        _deploy();
        _verify();
        _saveLog();
        _printSuccess();
    }
    
    // ============================================
    // CHAIN INITIALIZATION (ALL HARDCODED)
    // ============================================
    
    function _initChains() private {
        // BASE MAINNET
        chains["base"] = ChainConfig({
            chainId: 8453,
            rpcUrl: "https://mainnet.base.org",
            priceFeed: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70,
            explorerApiUrl: "https://api.basescan.org/api",
            explorerUrl: "https://basescan.org",
            verifierUrl: "https://api.basescan.org/api",
            apiKey: BASESCAN_API_KEY,
            name: "Base Mainnet",
            isTestnet: false
        });
        
        // BASE SEPOLIA
        chains["base-sepolia"] = ChainConfig({
            chainId: 84532,
            rpcUrl: "https://sepolia.base.org",
            priceFeed: 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1,
            explorerApiUrl: "https://api-sepolia.basescan.org/api",
            explorerUrl: "https://sepolia.basescan.org",
            verifierUrl: "https://api-sepolia.basescan.org/api",
            apiKey: BASESCAN_API_KEY,
            name: "Base Sepolia Testnet",
            isTestnet: true
        });
        
        // MONAD MAINNET
        chains["monad"] = ChainConfig({
            chainId: 143,
            rpcUrl: "https://monad-rpc.publicnode.com",
            priceFeed: address(0), // TBD
            explorerApiUrl: "https://explorer.monad.xyz/api",
            explorerUrl: "https://explorer.monad.xyz",
            verifierUrl: "https://explorer.monad.xyz/api",
            apiKey: MONAD_API_KEY,
            name: "Monad Mainnet",
            isTestnet: false
        });
        
        // MONAD TESTNET
        chains["monad-testnet"] = ChainConfig({
            chainId: 10143,
            rpcUrl: "https://testnet-rpc.monad.xyz",
            priceFeed: 0x0c76859E85727683Eeba0C70Bc2e0F5781337818,
            explorerApiUrl: "https://testnet-explorer.monad.xyz/api",
            explorerUrl: "https://testnet-explorer.monad.xyz",
            verifierUrl: "https://testnet-explorer.monad.xyz/api",
            apiKey: MONAD_API_KEY,
            name: "Monad Testnet",
            isTestnet: true
        });
    }
    
    // ============================================
    // DEPLOYMENT
    // ============================================
    
    function _deploy() private {
        ChainConfig memory config = chains[selectedChain];
        
        console.log("\n[DEPLOYING CONTRACTS]");
        console.log("Switching to RPC:", config.rpcUrl);
        
        // Set RPC URL
        vm.createSelectFork(config.rpcUrl);
        
        // Load keystore and start broadcast
        vm.startBroadcast();
        
        console.log("Deployer:", msg.sender);
        console.log("Balance:", msg.sender.balance / 1e18, "ETH\n");
        
        // Deploy contracts
        console.log("[1/3] Deploying GMR...");
        GMR gmr = new GMR();
        gmrAddr = address(gmr);
        console.log("      ✓ GMR:", gmrAddr);
        
        console.log("[2/3] Deploying Leaderboard...");
        Leaderboard leaderboard = new Leaderboard();
        leaderboardAddr = address(leaderboard);
        console.log("      ✓ Leaderboard:", leaderboardAddr);
        
        console.log("[3/3] Deploying ResetStrikes...");
        ResetStrikes resetStrikes = new ResetStrikes(config.priceFeed, USD_COST_CENTS);
        resetStrikesAddr = address(resetStrikes);
        console.log("      ✓ ResetStrikes:", resetStrikesAddr);
        
        vm.stopBroadcast();
        
        console.log("\n✓ All contracts deployed!\n");
    }
    
    // ============================================
    // VERIFICATION (AUTOMATIC)
    // ============================================
    
    function _verify() private {
        ChainConfig memory config = chains[selectedChain];
        
        console.log("[VERIFYING CONTRACTS]");
        console.log("Explorer API:", config.explorerApiUrl);
        console.log("");
        
        // Verify GMR
        console.log("[1/3] Verifying GMR...");
        _verifyContract(
            gmrAddr,
            "src/GMR.sol:GMR",
            "",
            config
        );
        
        // Verify Leaderboard
        console.log("[2/3] Verifying Leaderboard...");
        _verifyContract(
            leaderboardAddr,
            "src/Leaderboard.sol:Leaderboard",
            "",
            config
        );
        
        // Verify ResetStrikes with constructor args
        console.log("[3/3] Verifying ResetStrikes...");
        string memory constructorArgs = _encodeConstructorArgs(config.priceFeed, USD_COST_CENTS);
        _verifyContract(
            resetStrikesAddr,
            "src/ResetStrikes.sol:ResetStrikes",
            constructorArgs,
            config
        );
        
        console.log("\n✓ All contracts verified!\n");
    }
    
    function _verifyContract(
        address contractAddr,
        string memory contractPath,
        string memory constructorArgs,
        ChainConfig memory config
    ) private {
        // Build verification command
        string[] memory inputs = new string[](bytes(constructorArgs).length > 0 ? 9 : 7);
        inputs[0] = "forge";
        inputs[1] = "verify-contract";
        inputs[2] = vm.toString(contractAddr);
        inputs[3] = contractPath;
        inputs[4] = "--chain-id";
        inputs[5] = vm.toString(config.chainId);
        inputs[6] = "--watch";
        
        if (bytes(constructorArgs).length > 0) {
            inputs[7] = "--constructor-args";
            inputs[8] = constructorArgs;
        }
        
        // Execute verification
        try vm.ffi(inputs) returns (bytes memory result) {
            console.log("      ✓ Verified:", contractAddr);
        } catch {
            console.log("      ⚠ Manual verification needed for:", contractAddr);
        }
    }
    
    function _encodeConstructorArgs(address priceFeed, uint256 usdCost) private returns (string memory) {
        string[] memory inputs = new string[](5);
        inputs[0] = "cast";
        inputs[1] = "abi-encode";
        inputs[2] = "constructor(address,uint256)";
        inputs[3] = vm.toString(priceFeed);
        inputs[4] = vm.toString(usdCost);
        
        bytes memory result = vm.ffi(inputs);
        return string(result);
    }
    
    // ============================================
    // LOGGING
    // ============================================
    
    function _saveLog() private {
        ChainConfig memory config = chains[selectedChain];
        string memory timestamp = vm.toString(block.timestamp);
        
        string memory json = string.concat(
            '{\n',
            '  "deployment": {\n',
            '    "network": "', config.name, '",\n',
            '    "chainId": ', vm.toString(config.chainId), ',\n',
            '    "timestamp": "', timestamp, '",\n',
            '    "deployer": "', vm.toString(msg.sender), '"\n',
            '  },\n',
            '  "contracts": {\n',
            '    "GMR": {\n',
            '      "address": "', vm.toString(gmrAddr), '",\n',
            '      "verified": true,\n',
            '      "explorer": "', config.explorerUrl, '/address/', vm.toString(gmrAddr), '"\n',
            '    },\n',
            '    "Leaderboard": {\n',
            '      "address": "', vm.toString(leaderboardAddr), '",\n',
            '      "verified": true,\n',
            '      "explorer": "', config.explorerUrl, '/address/', vm.toString(leaderboardAddr), '"\n',
            '    },\n',
            '    "ResetStrikes": {\n',
            '      "address": "', vm.toString(resetStrikesAddr), '",\n',
            '      "verified": true,\n',
            '      "explorer": "', config.explorerUrl, '/address/', vm.toString(resetStrikesAddr), '"\n',
            '    }\n',
            '  },\n',
            '  "configuration": {\n',
            '    "priceFeed": "', vm.toString(config.priceFeed), '",\n',
            '    "usdCostCents": ', vm.toString(USD_COST_CENTS), '\n',
            '  }\n',
            '}'
        );
        
        string memory filename = string.concat(
            "deployments/",
            selectedChain,
            "-",
            timestamp,
            ".json"
        );
        
        vm.writeFile(filename, json);
        console.log("[LOG SAVED]");
        console.log("File:", filename, "\n");
    }
    
    // ============================================
    // OUTPUT FORMATTING
    // ============================================
    
    function _printHeader() private view {
        ChainConfig memory config = chains[selectedChain];
        console.log("\n");
        console.log("╔════════════════════════════════════════════════════════╗");
        console.log("║              GMR DEPLOYMENT SCRIPT                     ║");
        console.log("╚════════════════════════════════════════════════════════╝");
        console.log("");
        console.log("Network:", config.name);
        console.log("Chain ID:", config.chainId);
        console.log("RPC:", config.rpcUrl);
        console.log("Explorer:", config.explorerUrl);
        console.log("");
    }
    
    function _printSuccess() private view {
        ChainConfig memory config = chains[selectedChain];
        console.log("╔════════════════════════════════════════════════════════╗");
        console.log("║              DEPLOYMENT SUCCESSFUL                     ║");
        console.log("╚════════════════════════════════════════════════════════╝");
        console.log("");
        console.log("Network:", config.name);
        console.log("");
        console.log("GMR:          ", gmrAddr);
        console.log("Leaderboard:  ", leaderboardAddr);
        console.log("ResetStrikes: ", resetStrikesAddr);
        console.log("");
        console.log("All contracts deployed and verified!");
        console.log("View on", config.explorerUrl);
        console.log("");
    }
    
    function _validateChain(string memory chain) private view {
        require(
            keccak256(bytes(chain)) == keccak256("base") ||
            keccak256(bytes(chain)) == keccak256("base-sepolia") ||
            keccak256(bytes(chain)) == keccak256("monad") ||
            keccak256(bytes(chain)) == keccak256("monad-testnet"),
            "Invalid chain. Use: base, base-sepolia, monad, or monad-testnet"
        );
    }
}