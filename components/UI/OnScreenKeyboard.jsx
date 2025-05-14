// components/OnScreenKeyboard.js
import React, {useState} from 'react';

const OnScreenKeyboard = ({onKeyPress}) => {
    const [isUpperCase, setIsUpperCase] = useState(false);

    const handleMajPress = () => {
        setIsUpperCase(!isUpperCase);
    };

    const rows = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Maj', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
        ['Space']
    ];

    return (
        <div className="keyboard">
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.map(key => (
                        <button
                            key={key}
                            onClick={() => key === 'Maj' ? handleMajPress() : onKeyPress(key)}
                            className={`key ${key === 'Space' ? 'space-key' : ''}`}
                        >
                            {key === 'Space' ? 'Space' : key}
                        </button>
                    ))}
                </div>
            ))}
            <style jsx>{`
                .keyboard {
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #eee;
                    padding: 10px;
                    border: 1px solid #ccc;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                }

                .keyboard-row {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 5px;
                }

                .key {
                    margin: 5px;
                    padding: 10px 20px;
                    font-size: 16px;
                    background: #fff;
                    border: 1px solid #ccc;
                    cursor: pointer;
                }

                .key:active {
                    background: #ddd;
                }

                .space-key {
                    flex: 1;
                    text-align: center;
                    padding: 10px;
                }
            `}</style>
        </div>
    );
};

export default OnScreenKeyboard;
