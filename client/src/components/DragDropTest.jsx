import { useEffect, useRef, useState } from 'react';
import '../styles/DragDropTest.css';
const DAYS = 3;
const DIVS = ['Div 1', 'Div 2', 'Div 3', 'Div 4', 'Div 5'];
const Event = {
    name: 'string',
    startIndex: null,
    duration: 0,
};
const HOURS = 24;
const TEN_MIN_INTERVALS = HOURS * 6;

const CELL_HEIGHT = 20;
const BORDER_WIDTH = 1;
const CELL_TOTAL = CELL_HEIGHT + BORDER_WIDTH;

const DragDropTest = () => {
    const [days, setDays] = useState(
        Array(DAYS)
            .fill()
            .map(() => [])
    );
    const [calendar, setCalendar] = useState(
        Array(DAYS)
            .fill()
            .map(() => [])
    );

    const [droppedDivs, setDroppedDivs] = useState([]);
    const dragOverItem = useRef();
    const draggedItem = useRef({ day: null, index: null, name: null });
    const gridRefs = useRef({});

    const timeLabel = (index) => {
        const hour = Math.floor(index / 6);
        const minute = (index % 6) * 10;
        return `${hour}:${minute < 10 ? '0' : ''}${minute}`;
    };

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

    const handleDropInside = (e, dayIndex, i) => {
        const gridElement = gridRefs.current[dayIndex];
        const rect = gridElement.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        const cellHeight = 20;
        const calculatedIndex = Math.floor(offsetY / cellHeight);

        const { name } = draggedItem.current;
        if (!name) return;

        const defaultDuration = 3; // 30 minutes
        setCalendar((prev) => {
            const updated = prev.map((events) => [...events]);
            // Remove previous instance if any
            for (let d = 0; d < updated.length; d++) {
                updated[d] = updated[d].filter((event) => event.name !== name);
            }
            updated[dayIndex].push({
                name,
                startIndex: calculatedIndex,
                startTime: i,
                duration: defaultDuration,
            });
            return updated;
        });
        console.log(calendar);
        setDroppedDivs((prev) => prev.filter((n) => n !== name));
        draggedItem.current = { day: null, index: null, name: null };
    };

    const handleDropReorder = (e, targetDayIndex, targetItemIndex = null) => {
        const {
            day: sourceDayIndex,
            index: sourceItemIndex,
            name,
        } = draggedItem.current;
        if (!name) return;

        setDays((prev) => {
            const newDays = prev.map((arr) => [...arr]);
            if (sourceDayIndex !== null) {
                newDays[sourceDayIndex].splice(sourceItemIndex, 1);
            } else {
                setDroppedDivs((prev) => prev.filter((n) => n !== name));
            }
            if (targetItemIndex !== null) {
                newDays[targetDayIndex].splice(targetItemIndex, 0, name);
            } else {
                newDays[targetDayIndex].push(name);
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
                    {calendar.map((events, dayIndex) => (
                        <div className="day-column" key={dayIndex}>
                            <h2>Day {dayIndex + 1}</h2>
                            <div
                                className="day-grid"
                                ref={(e) => (gridRefs.current[dayIndex] = e)}
                            >
                                {[...Array(TEN_MIN_INTERVALS)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="time-cell"
                                        onDragOver={handleOnDragOver}
                                        onDrop={(e) =>
                                            handleDropInside(e, dayIndex, i)
                                        }
                                    >
                                        {i % 6 === 0 && timeLabel(i)}
                                    </div>
                                ))}
                                {events?.map((event, i) => (
                                    <div
                                        key={event.name + i}
                                        className="event-block"
                                        draggable
                                        onDragStart={(e) =>
                                            handleDrag(
                                                e,
                                                event.name,
                                                dayIndex,
                                                i
                                            )
                                        }
                                        onDrop={(e) =>
                                            handleDropInside(
                                                e,
                                                dayIndex,
                                                event.startIndex
                                            )
                                        }
                                        style={{
                                            top: `${Math.round(event.startIndex * CELL_TOTAL)}px`,
                                            height: `${event.duration * CELL_TOTAL - BORDER_WIDTH}px`,
                                        }}
                                    >
                                        {event.name}
                                        {`${timeLabel(event.startTime)}-${timeLabel(event.startTime + event.duration)}`}
                                        <div
                                            className="resizer"
                                            onMouseDown={(e) =>
                                                handleResizeStart(
                                                    e,
                                                    dayIndex,
                                                    i
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div></div>
                </div>
            </div>
        </>
    );
};
export default DragDropTest;
