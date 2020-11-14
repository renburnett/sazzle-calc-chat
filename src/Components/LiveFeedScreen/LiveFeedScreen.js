import React from "react";
import './LiveFeedScreen.css';

const LiveFeedScreen = ({ chatFeed }) => {
    const renderChat = () => {
        return chatFeed.map(({ userName, operation, answer }, index) => {
            if (operation === undefined) { return null }
            const opStr = operation.toString().replace(/[,]+/g, " ").trim();

            if (index % 2 !== 0) {
                return (
                    <div className="pull-left" key={index}>
                        <div className="message-bubble-left">
                            <p>user: {userName}</p>
                            <p>operation: {opStr} = {answer}</p>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className="pull-right" key={index}>
                        <div className="message-bubble-right">
                            <p>user: {userName}</p>
                            <p>operation: {opStr} = {answer}</p>
                        </div>
                    </div>
                )
            }
        })
      }

    return (
        <div className="live-feed-screen">
            { chatFeed.length > 0 ? renderChat() : "no chats yet. . ." }
        </div>
    )
}

export default LiveFeedScreen;