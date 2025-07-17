import { useEffect, useRef, useState } from 'react';
import '../styles/DragDropTest.css';
const DAYS = 3;
const DIVS = ['Div 1', 'Div 2', 'Div 3', 'Div 4', 'Div 5'];
const HOURS = 24;
const INTERVALS_IN_HOUR = 6;
const TEN_MIN_INTERVALS = HOURS * INTERVALS_IN_HOUR;
const CELL_HEIGHT = 20;
const BORDER_WIDTH = 1;
const CELL_TOTAL = CELL_HEIGHT + BORDER_WIDTH;
const DEFAULT_DURATION = 3;

const DragDropTest = () => {
    const [calendar, setCalendar] = useState(
        Array(DAYS)
            .fill()
            .map(() => [])
    );
    const [newHeight, setNewHeight] = useState(null);

    const [droppedDivs, setDroppedDivs] = useState([]);
    const draggedItem = useRef({ day: null, index: null, name: null });
    const gridRefs = useRef({});

    const timeLabel = (index) => {
        const hour = Math.floor(index / INTERVALS_IN_HOUR);
        const minute = (index % INTERVALS_IN_HOUR) * 10;
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

    const handleDropOutside = (e) => {
        const name = e.dataTransfer.getData('name');
        setDroppedDivs((prev) => [...prev.filter((n) => n !== name), name]);
        setDays((prev) => prev.map((day) => day.filter((n) => n !== name)));
    };

    const handleDropInside = (e, dayIndex) => {
        const gridElement = gridRefs.current[dayIndex];
        const rect = gridElement.getBoundingClientRect();
        const scrollTop = gridElement.scrollTop;
        const offsetY = e.clientY - rect.top + scrollTop;
        const calculatedIndex = Math.floor(offsetY / CELL_TOTAL);

        const { name, day, index } = draggedItem.current;
        if (!name) return;

        let duration;
        setCalendar((prev) => {
            const updated = prev.map((events) => [...events]);
            if (day !== null && index !== null) {
                const removed = updated[day].splice(index, 1)[0];
                duration = removed?.duration
                    ? removed.duration
                    : DEFAULT_DURATION;
            }
            updated[dayIndex].push({
                name,
                startIndex: calculatedIndex,
                duration: duration,
            });
            return updated;
        });
        console.log(calendar);
        setDroppedDivs((prev) => prev.filter((n) => n !== name));
        draggedItem.current = { day: null, index: null, name: null };
    };

    const handleResizeStart = (e, dayIndex, targetItemIndex) => {
        e.preventDefault();
        e.stopPropagation();
        setNewHeight({ dayIndex, targetItemIndex, startY: e.clientY });
    };

    const handleResizeMove = (e) => {
        if (!newHeight) {
            return;
        }
        const heightDiff = e.clientY - newHeight.startY;
        const timeBlocksDiff = Math.round(heightDiff / CELL_TOTAL);

        setCalendar((prev) => {
            const updated = [...prev];
            const event = {
                ...updated[newHeight.dayIndex][newHeight.targetItemIndex],
            };
            event.duration = Math.max(1, event.duration + timeBlocksDiff);
            updated[newHeight.dayIndex][newHeight.targetItemIndex] = event;
            return updated;
        });

        setNewHeight((prev) => ({
            ...prev,
            startY: e.clientY,
        }));
    };

    const handleMouseUp = () => {
        if (newHeight) {
            setNewHeight(null);
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleResizeMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [newHeight]);

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
                                            handleDropInside(e, dayIndex)
                                        }
                                    >
                                        {i % INTERVALS_IN_HOUR === 0 &&
                                            timeLabel(i)}
                                    </div>
                                ))}
                                <div>
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
                                                top: `${Math.round(event.startIndex * CELL_HEIGHT)}px`,
                                                height: `${event.duration * CELL_HEIGHT}px`,
                                            }}
                                        >
                                            {event.name}
                                            {` ${timeLabel(event.startIndex)}-${timeLabel(event.startIndex + event.duration)}`}
                                            <div
                                                className="resizer"
                                                onMouseDown={(e) =>
                                                    handleResizeStart(
                                                        e,
                                                        dayIndex,
                                                        i
                                                    )
                                                }
                                            >
                                                +
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
export default DragDropTest;
