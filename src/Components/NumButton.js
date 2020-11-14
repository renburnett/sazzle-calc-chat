import React from "react";

const NumButton = ({ num, handleNumberClick }) => {
    return (
        <button type="button" onClick={handleNumberClick} value={num}>{num}</button>
    );
}

export default NumButton;