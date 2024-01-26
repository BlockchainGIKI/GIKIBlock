// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.18;

contract Benchmark {
    struct User {
        string name;
        uint256 account_number;
        uint256 balance;
    }

    uint256 private active_account_numbers;
    mapping(uint256 => User) public accNumToUser;

    ///////////////////
    // Errors /////////
    ///////////////////
    error Benchmark__NeedsMoreThanZero();
    error Benchmark__NameIsNull();

    ///////////////////
    // Events /////////
    ///////////////////
    event UserCreated(bool status);
    event MoneyIssued(bool status);
    event MoneyTransferred(bool status);

    ///////////////////
    // Modifiers //////
    ///////////////////
    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert Benchmark__NeedsMoreThanZero();
        }
        _;
    }

    modifier nullName(string memory _name) {
        bytes memory tempEmptyStringTest = bytes(_name); // Uses memory
        if (tempEmptyStringTest.length == 0) {
            emit UserCreated(false);
            revert Benchmark__NameIsNull();
        }
        _;
    }

    function createUser(
        string memory _name,
        uint256 _balance
    ) public nullName(_name) moreThanZero(_balance) {
        active_account_numbers = active_account_numbers + 1;
        accNumToUser[active_account_numbers] = User(
            _name,
            active_account_numbers,
            _balance
        );
        emit UserCreated(true);
    }

    function issueMoney(uint256 _amount, uint256 _acc_num) public {
        accNumToUser[_acc_num].balance += _amount;
        emit MoneyIssued(true);
    }

    function transferMoney(
        uint256 _amount,
        uint256 _sender_acc_num,
        uint256 _receiver_acc_num
    ) public {
        require(
            _amount < accNumToUser[_sender_acc_num].balance,
            "The amount is less than the balance!"
        );
        accNumToUser[_sender_acc_num].balance -= _amount;
        accNumToUser[_receiver_acc_num].balance += _amount;
        emit MoneyTransferred(true);
    }

    function getUser(uint256 _acc_num) public view returns (User memory) {
        return accNumToUser[_acc_num];
    }
}
