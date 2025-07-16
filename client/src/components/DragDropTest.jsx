import { useEffect, useRef, useState } from 'react';
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
    const dragOverItem = useRef();
    const draggedItem = useRef({ day: null, index: null, name: null });

    const handleDrag = (e, name, dayIndex = null, index = null) => {
        draggedItem.current = { day: dayIndex, index: index, name: name };
        e.dataTransfer.setData('name', name);
        console.log(draggedItem.current);
    };

    const handleOnDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDropOutside = (e) => {
        const name = e.dataTransfer.getData('name');
        setDroppedDivs((prev) => [...prev.filter((n) => n !== name), name]);
        setDays((prev) => prev.map((day) => day.filter((n) => n !== name)));
    };

    const handleDropReorder = (e, dayIndex, onDayIndex = null) => {
        onDayIndex = dragOverItem.current;
        const { day, index, name } = draggedItem.current;
        if (!name) return;
        setDays((prev) => {
            let newDays = prev.map((arr) => [...arr]);
            if (day !== null) {
                newDays[day].splice(index, 1);
                newDays[dayIndex].splice(index, 0, name);
            } else {
                setDroppedDivs((d) => d.filter((n) => n !== name));
            }
            if (onDayIndex !== null && day === dayIndex) {
                newDays[dayIndex].splice(index, 1);
                newDays[dayIndex].splice(onDayIndex, 0, name);
            } else {
                if (onDayIndex !== null) {
                    newDays[dayIndex].splice(onDayIndex, 0, name);
                } else {
                    newDays[dayIndex].push(name);
                }
            }

            return newDays;
        });

        draggedItem.current = { day: null, index: null, name: null };
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
                                onDragStart={(e) =>
                                    handleDrag(e, div, null, null)
                                }
                            >
                                {div}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="days-cols">
                    {days.map((dayItems, dayIndex) => (
                        <div
                            className="day-col"
                            onDragOver={handleOnDragOver}
                            onDrop={(e) => handleDropReorder(e, dayIndex)}
                        >
                            <h2>Day {dayIndex + 1}</h2>
                            {dayItems.map((div, index) => (
                                <div
                                    className="draggable-div"
                                    draggable
                                    onDragStart={(e) =>
                                        handleDrag(e, div, dayIndex, index)
                                    }
                                    onDragEnter={(e) =>
                                        handleDragEnter(e, index)
                                    }
                                    onDrop={(e) =>
                                        handleDropReorder(e, dayIndex, index)
                                    }
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
