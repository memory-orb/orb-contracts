// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArweaveMapping
 * @dev 存储以太坊地址到 Arweave 交易 ID 的映射关系
 */
contract ArweaveMapping {
    // 从地址映射到 Arweave 交易 ID 的映射
    mapping(address => string) private addressToArweaveTxId;
    mapping(address => string) private addressToDescription;
    mapping(address => string) private addressToPrice;

    // 存储所有已注册的地址
    address[] private registeredAddresses;

    // 从地址到其在数组中的索引位置的映射（用于检查是否已注册）
    mapping(address => uint256) private addressToIndex;

    // 标记地址是否已被注册（索引+1，因为0表示未注册）
    mapping(address => uint256) private addressRegistered;

    // 事件，当映射更新时触发
    event TxIdUpdated(address indexed user, string arweaveTxId);

    // 定义结构体来存储地址及其对应的Arweave交易ID
    struct AddressMappingEntry {
        address userAddress;
        string arweaveTxId;
        string price;
        string description;
    }

    /**
     * @dev 设置或更新调用者地址关联的 Arweave 交易 ID
     * @param _arweaveTxId Arweave 交易 ID
     * @param _description 地址描述
     * @param _price 地址价格
     */
    function setArweaveTxId(string calldata _arweaveTxId, string calldata _description, string calldata _price) external {
        // 若此地址是首次注册，添加到地址数组中
        if (addressRegistered[msg.sender] == 0) {
            addressToIndex[msg.sender] = registeredAddresses.length;
            registeredAddresses.push(msg.sender);
            addressRegistered[msg.sender] = 1;
        }

        addressToArweaveTxId[msg.sender] = _arweaveTxId;
        addressToDescription[msg.sender] = _description;
        addressToPrice[msg.sender] = _price;
        emit TxIdUpdated(msg.sender, _arweaveTxId);
    }

    /**
     * @dev 获取指定地址关联的 Arweave 交易 ID
     * @param _address 要查询的地址
     * @return 关联的 Arweave 交易 ID，若未设置则返回空字符串
     */
    function getArweaveTxId(
        address _address
    ) external view returns (string memory) {
        return addressToArweaveTxId[_address];
    }

    /**
     * @dev 获取调用者地址关联的 Arweave 交易 ID
     * @return 调用者的 Arweave 交易 ID，若未设置则返回空字符串
     */
    function getMyArweaveTxId() external view returns (string memory) {
        return addressToArweaveTxId[msg.sender];
    }

    /**
     * @dev 获取已注册地址的总数
     * @return 注册的地址总数
     */
    function getTotalRegisteredAddresses() external view returns (uint256) {
        return registeredAddresses.length;
    }

    /**
     * @dev 分页获取已注册的地址列表及其对应的Arweave交易ID
     * @param _offset 起始位置
     * @param _limit 返回数量限制
     * @return mappings 包含地址和对应Arweave交易ID的结构体数组
     */
    function getRegisteredAddresses(
        uint256 _offset,
        uint256 _limit
    )
        external
        view
        returns (AddressMappingEntry[] memory mappings)
    {
        // 确保不越界
        if (_offset >= registeredAddresses.length || _limit == 0) {
            return new AddressMappingEntry[](0);
        }

        // 计算实际要返回的数量 (避免溢出)
        uint256 resultCount;
        if (_limit > registeredAddresses.length - _offset) {
            resultCount = registeredAddresses.length - _offset;
        } else {
            resultCount = _limit;
        }

        // 创建结果数组
        mappings = new AddressMappingEntry[](resultCount);

        // 填充结果数组
        for (uint256 i = 0; i < resultCount; i++) {
            address currentAddress = registeredAddresses[_offset + i];
            mappings[i] = AddressMappingEntry({
                userAddress: currentAddress,
                arweaveTxId: addressToArweaveTxId[currentAddress],
                price: addressToPrice[currentAddress],
                description: addressToDescription[currentAddress]
            });
        }

        return mappings;
    }
}
