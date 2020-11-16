import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import './Calculator.css';
import LiveFeedScreen from '../LiveFeedScreen/LiveFeedScreen';
import NumButton from '../NumButton';

const socket = io('https://sazzle-server.herokuapp.com/', {
    autoConnect: false,
})

const Calculator = () => {
    const [chatFeed, setChatFeed] = useState(JSON.parse(localStorage.getItem('chatFeed')) ?? []);
    const message = { userName: 'n/a', operation: [], answer: '' };
      
    useEffect(() => {
        socket.connect();
    }, []);

      useEffect(() => {
        socket.on('chat', (msg) => {
            setChatFeed(cfeed => [ ...cfeed, msg ]);
            localStorage.setItem('chatFeed', JSON.stringify(chatFeed));
        });
        return () => {
            socket.off("chat");
        };
      }, [chatFeed]);

      const sendChat = () => {
        socket.emit('chat', message);
      }

  ////////////////
      
    const numArr = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0];

    const operators = new Map(); // set in pemdas order
    operators.set("*", (a, b) => a * b);
    operators.set("/", (a, b) => a / b);
    operators.set("+", (a, b) => a + b);
    operators.set("-", (a, b) => a - b); 

    const [currentCalcScreen, setCurrentCalcScreen] = useState('0');

    const operations = JSON.parse(localStorage.getItem('operations')) ?? [];
    let operationLocked = JSON.parse(localStorage.getItem('operationLocked')) ?? false;
    let tempNum = JSON.parse(localStorage.getItem('tempNum')) ?? '';

    const calculateTotal = () => {
        const operationsCp = [...operations]; // copy so we dont don't modify original array

        for (const [operator, mathFunc] of operators.entries()) {
            for (let i = 1; i < operationsCp.length - 1; i++) {
                if (operator === operationsCp[i]) {
                    operationsCp.splice(i - 1, 3, mathFunc(operationsCp[i - 1], operationsCp[i + 1])); //replace operands and operator with result
                }
            }
        }

        let finalResult = typeof(operationsCp[0]) === "number" ? operationsCp[0] : operationsCp[1];
        if (operationsCp[0] === '-') { finalResult *= -1 };

        if (finalResult === undefined) { finalResult = currentCalcScreen }; // if no operation was performed use old result value

        setCurrentCalcScreen(finalResult);
        message.operation = operations;
        message.answer = finalResult;
        
        if (localStorage.getItem('message')) {
            message.userName = JSON.parse(localStorage.getItem('message')).userName
        } else {
            message.userName = `${ Math.floor(Math.random() * 10000) }`;  
        }

        sendChat();

        localStorage.clear();
        localStorage.setItem('currentCalcScreen', JSON.stringify(finalResult));
        localStorage.setItem('message', JSON.stringify(message));

        tempNum = '';
        operations.length = 0; //clear array
        operationLocked = false;
    }

    const handleOperationClick = (event) => {
        if (tempNum !== '') { operations.push(Number(tempNum)); }

        if (!operationLocked) {
            setCurrentCalcScreen(event.target.value);
            operations.push(event.target.value);

            operationLocked = true;
            localStorage.setItem('operationLocked', JSON.stringify(true));
        }
        tempNum = '';
        localStorage.setItem('tempNum', JSON.stringify(tempNum));
        localStorage.setItem('operations', JSON.stringify(operations));
        localStorage.setItem('currentCalcScreen', JSON.stringify(event.target.value));
    }

    const handleEqualsClick = (event) => {    
        operationLocked = false;
        operations.push(Number(tempNum));
        calculateTotal();
        
        tempNum = '';
        operations.length = 0; //clear array
        setCurrentCalcScreen('0');
    }

    const handleAllClearClick = (event) => {
        localStorage.clear();
        localStorage.setItem('currentCalcScreen', JSON.stringify('0'));
        setCurrentCalcScreen('0');

        tempNum = '';
        operations.length = 0; //clear array
        operationLocked = false;
    }

    const handleNumberClick = (event) => {
        tempNum += event.target.value;

        setCurrentCalcScreen(tempNum);
        operationLocked = false;
        
        localStorage.setItem('currentCalcScreen', JSON.stringify(event.target.value));
        localStorage.setItem('operationLocked', JSON.stringify(false));
        localStorage.setItem('tempNum', JSON.stringify(tempNum));
        localStorage.setItem('operations', JSON.stringify(operations));
    }   

    const handleClearChatFeed = () => {
        localStorage.clear();
        setChatFeed([]);
    }

    const handleUserNameChange = (event) => {
        message.userName = event.target.value;
    }


    const handleUserNameSubmit = (event) => {
        event.preventDefault();
        localStorage.setItem('message', JSON.stringify(message));
        console.log(message)
    }


    return (
        <>
            <div className="calculator">
                <input type="text" className="calc-screen" value={currentCalcScreen ?? '0'} readOnly={true}/>
                <div className="calc-keys">
                    <button type="button" className="operators" value="+" onClick={handleOperationClick}> + </button>
                    <button type="button" className="operators" value="-" onClick={handleOperationClick}> - </button>
                    <button type="button" className="operators" value="*" onClick={handleOperationClick}> &times; </button>
                    <button type="button" className="operators" value="/" onClick={handleOperationClick}> &divide; </button>
                    { numArr.map( (num, idx) => <NumButton handleNumberClick={handleNumberClick} num={num} key={idx} /> ) }
                    <button type="button" className="operators" value="all-clear" onClick={handleAllClearClick}> AC </button>

                    <button type="button" className="operators" value="=" onClick={handleEqualsClick}> = </button>
                </div>
            </div>
            <button type="button" className="clear-chat" onClick={handleClearChatFeed}> Clear Chat Feed </button>
            <br/>
            <form onSubmit={handleUserNameSubmit}>
                <input type="text" onChange={handleUserNameChange}/>
                <input type="submit" value="Submit Username"/>
            </form>
            <hr className="hr-ting"/>
            <LiveFeedScreen chatFeed={chatFeed}/>
        </>
    )
}

export default Calculator;