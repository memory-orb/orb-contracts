// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MemoryMapping
 * @dev 存储以太坊地址到 Arweave 交易 ID 的映射关系
 */
contract MemoryMapping {
    // 事件，当映射更新时触发
    event MemoryAdded(address indexed user, string memoryId);

    // 定义结构体来存储地址及其对应的Arweave交易ID
    struct MemoryEntry {
        string memoryId;
        string price;
        string description;
    }

    address[] private registeredUsers;
    mapping(address => MemoryEntry[]) private sharedMemories;
    MemoryEntry[30] private latestMemories;
    uint8 private latestMemoryIndex;
    uint256 private totalMemories;

    /**
     * @dev 设置或更新调用者地址关联的 Arweave 交易 ID
     * @param _memoryId Arweave 交易 ID
     * @param _description 地址描述
     * @param _price 地址价格
     */
    function addMemory(
        string calldata _memoryId,
        string calldata _description,
        string calldata _price
    ) external {
        sharedMemories[msg.sender].push(
            MemoryEntry({
                memoryId: _memoryId,
                price: _price,
                description: _description
            })
        );
        latestMemories[latestMemoryIndex] = MemoryEntry({
            memoryId: _memoryId,
            price: _price,
            description: _description
        });
        latestMemoryIndex = (latestMemoryIndex + 1) % 30;
        totalMemories++;
        if (sharedMemories[msg.sender].length == 1) {
            registeredUsers.push(msg.sender);
        }
        emit MemoryAdded(msg.sender, _memoryId);
    }

    /**
     * @dev 获取已注册地址的总数
     * @return 注册的地址总数
     */
    function getUsersAmount() external view returns (uint256) {
        return registeredUsers.length;
    }

    function getMemoriesAmount() external view returns (uint256) {
        return totalMemories;
    }

    /**
     * @dev 获取用户的记忆数量
     * @param _user 用户地址
     */
    function getUserMemoryAmount(
        address _user
    ) external view returns (uint256) {
        return sharedMemories[_user].length;
    }

    /**
     * @dev 获取用户的记忆列表
     * @param _user 用户地址
     */
    function getUserMemories(
        address _user
    ) external view returns (MemoryEntry[] memory) {
        return sharedMemories[_user];
    }

    /**
     * @dev 获取最新的记忆列表
     * @return 最新的记忆列表
     */
    function getLatestMemories() external view returns (MemoryEntry[] memory) {
        uint256 count = totalMemories < 30 ? totalMemories : 30;
        MemoryEntry[] memory memories = new MemoryEntry[](count);
        for (uint256 i = 0; i < count; i++) {
            memories[i] = latestMemories[i];
        }
        return memories;
    }
}
