import { useEffect, useState } from 'react';
import '../styles/DragDropTest.css';
const DAYS = 7;
const DIVS = [
    'Test Div 1',
    'Test Div 2',
    'Test Div 3',
    'Test Div 4',
    'Test Div 5',
];

const DragDropTest = () => {
    const [days, setDays] = useState(
        Array(DAYS)
            .fill()
            .map(() => [])
    );
    const [droppedDivs, setDroppedDivs] = useState([]);

    for (let i = 0; i < DAYS; i++) {
        const day = `Day ${i + 1}`;
    }

    const handleDrag = (e, name) => {
        e.dataTransfer.setData('name', name);
    };

    const handleOnDragOver = (e) => {
        e.preventDefault();
    };

    const handleDropOutside = (e) => {
        const name = e.dataTransfer.getData('name');
        setDroppedDivs((prev) => [...prev.filter((n) => n !== name), name]);
        setDays((prev) => prev.map((day) => day.filter((n) => n !== name)));
    };

    const handleDropOnDay = (e, index) => {
        const name = e.dataTransfer.getData('name');
        setDays((prev) =>
            prev.map((day, i) =>
                i === index
                    ? [...day.filter((n) => n !== name), name]
                    : day.filter((n) => n !== name)
            )
        );
        setDroppedDivs((prev) => prev.filter((n) => n !== name));
    };
    useEffect(() => {
        setDroppedDivs(DIVS);
    }, []);

    return (
        <>
            <div>
                <h1>Drag and Drop Test</h1>
                <div onDragOver={handleOnDragOver} onDrop={handleDropOutside}>
                    <h2>Trash :P</h2>
                </div>
                <div
                    className="activity-section"
                    onDragOver={handleOnDragOver}
                    onDrop={handleDropOutside}
                >
                    <h2>Divs</h2>
                    <div className="activity-options">
                        {droppedDivs.map((div) => (
                            <div
                                draggable
                                onDragStart={(e) => handleDrag(e, div)}
                            >
                                {div}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="days-cols">
                    {days.map((dayItems, index) => (
                        <div
                            className="day-col"
                            onDragOver={handleOnDragOver}
                            onDrop={(e) => handleDropOnDay(e, index)}
                        >
                            <h2>Day {index + 1}</h2>
                            {dayItems.map((div) => (
                                <div
                                    className="draggable-div"
                                    draggable
                                    onDragStart={(e) => handleDrag(e, div)}
                                >
                                    {div}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
export default DragDropTest;
