import { useEffect, useRef, useState } from 'react';
import '../styles/DragDropTest.css';
import { useNavigate, useParams, useLocation } from 'react-router';
import {
    fetchActivitesByTripId,
    fetchThingsToDo,
    fetchTripDetailsById,
    saveTrip,
} from '../utils/utils';
const HOURS = 24;
const INTERVALS_IN_HOUR = 6;
const TEN_MIN_INTERVALS = HOURS * INTERVALS_IN_HOUR;
const CELL_HEIGHT = 20;
const BORDER_WIDTH = 1;
const CELL_TOTAL = CELL_HEIGHT + BORDER_WIDTH;
const DEFAULT_DURATION = 3;

const DragDropTest = () => {
    const { tripId } = useParams();
    const { state } = useLocation();
    const parkId = state?.parkId;
    const [tripData, setTripData] = useState({});
    const nav = useNavigate();

    const [calendar, setCalendar] = useState([]);

    const [newHeight, setNewHeight] = useState(null);

    const [thingsToDo, setThingsToDo] = useState([]);
    const draggedItem = useRef({ day: null, index: null, activity: null });
    const gridRefs = useRef({});

    const timeLabel = (index) => {
        const hour = Math.floor(index / INTERVALS_IN_HOUR);
        const minute = (index % INTERVALS_IN_HOUR) * 10;
        return `${hour}:${minute < 10 ? '0' : ''}${minute}`;
    };

    const handleSave = async () => {
        const activitiesArray = [];
        for (let dayIndex = 0; dayIndex < calendar.length; dayIndex++) {
            const events = calendar[dayIndex];
            for (const event of events) {
                const { activity, startIndex, duration } = event;

                activitiesArray.push({
                    tripId: tripId,
                    thingsToDoID: activity.id,
                    day: dayIndex + 1,
                    startTime: startIndex * 10,
                    endTime: (startIndex + duration) * 10,
                    durationMins: duration * 10,
                });
            }
        }
        try {
            saveTrip(tripId, activitiesArray).then((response) => {
                if (response.status === 200) {
                    console.log('Activities saved successfully!');
                }
            });
            nav('/trips');
        } catch (err) {
            console.error('Failed to save activities:', err);
        }
    };

    const handleDrag = (e, activityOrEvent, dayIndex = null, index = null) => {
        let activity;
        if (dayIndex !== null && index !== null) {
            activity = activityOrEvent.activity;
        } else {
            activity = activityOrEvent;
        }

        draggedItem.current = {
            day: dayIndex,
            index: index,
            activity: activity,
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(activity));
    };

    const handleOnDragOver = (e) => {
        e.preventDefault();
    };

    const handleDropOutside = (e) => {
        e.preventDefault();
        const { day, index } = draggedItem.current;

        if (day !== null && index !== null) {
            setCalendar((prev) => {
                const updated = [...prev];
                updated[day] = [...updated[day]];
                updated[day].splice(index, 1);
                return updated;
            });
        }
        draggedItem.current = { day: null, index: null, activity: null };
    };

    const eventOverlapCheck = (events, newStart, newDuration, self = null) => {
        return events.some((event, i) => {
            if (i === self) {
                return false;
            }
            const existingStart = event.startIndex;
            const existingEnd = existingStart + event.duration;
            const newEnd = newStart + newDuration;

            return (
                (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd)
            );
        });
    };

    const handleDropInside = (e, dayIndex) => {
        const gridElement = gridRefs.current[dayIndex];
        const rect = gridElement.getBoundingClientRect();
        const scrollTop = gridElement.scrollTop;
        const offsetY = e.clientY - rect.top + scrollTop;
        const calculatedIndex = Math.floor(offsetY / CELL_TOTAL);

        const { activity, day, index } = draggedItem.current;
        if (!activity) return;

        let duration = DEFAULT_DURATION;
        setCalendar((prev) => {
            const updated = prev.map((events) => [...events]);
            if (day !== null && index !== null) {
                const removed = updated[day].splice(index, 1)[0];
                duration = removed?.duration
                    ? removed.duration
                    : DEFAULT_DURATION;
            }
            if (
                !eventOverlapCheck(updated[dayIndex], calculatedIndex, duration)
            ) {
                updated[dayIndex].push({
                    activity,
                    startIndex: calculatedIndex,
                    duration: duration,
                });
            }
            return updated;
        });
        draggedItem.current = { day: null, index: null, activity: null };
    };

    const handleResizeStart = (e, dayIndex, targetItemIndex) => {
        e.preventDefault();
        e.stopPropagation();
        setNewHeight({
            dayIndex,
            targetItemIndex,
            startY: e.clientY,
            initialY: e.clientY,
            initialDuration: calendar[dayIndex][targetItemIndex].duration,
        });
    };

    const handleResizeMove = (e) => {
        if (!newHeight) {
            return;
        }
        const heightDiff = e.clientY - newHeight.initialY;
        const timeBlocksDiff = Math.round(heightDiff / CELL_TOTAL);
        const newDuration = Math.max(
            1,
            newHeight.initialDuration + timeBlocksDiff
        );

        setCalendar((prev) => {
            const updated = [...prev];
            const dayEvents = updated[newHeight.dayIndex];
            const event = dayEvents[newHeight.targetItemIndex];
            if (
                !eventOverlapCheck(
                    dayEvents,
                    event.startIndex,
                    newDuration,
                    newHeight.targetItemIndex
                )
            ) {
                event.duration = newDuration;
                updated[newHeight.dayIndex][newHeight.targetItemIndex] = event;
            }
            return updated;
        });
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
        const fetchExistingData = async () => {
            const tripdeets = await fetchTripDetailsById(tripId);
            setTripData(tripdeets);
            const existingActivities = await fetchActivitesByTripId(tripId);
            const days = Array.from({ length: tripdeets.days }, () => []);
            for (const act of existingActivities) {
                const dayIndex = act.tripDay - 1;
                const startIndex = Math.floor(act.startTime / 10);
                const duration = Math.floor(act.durationMins / 10);

                const activity = act.thingstodo;
                if (activity) {
                    days[dayIndex].push({
                        activity,
                        startIndex,
                        duration,
                    });
                }
            }
            setCalendar(days);
        };
        fetchThingsToDo(setThingsToDo, parkId);
        fetchExistingData();
    }, [parkId, tripId]);

    useEffect(() => {
        if (tripData.days) {
            setCalendar(Array.from({ length: tripData.days }, () => []));
        }
    }, [tripData.days]);

    return (
        <>
            <div>
                <h1>
                    New Trip {tripId}: {tripData.name}
                </h1>
                <button onClick={handleSave}>Save</button>
                <div
                    className="activity-section"
                    onDragOver={handleOnDragOver}
                    onDrop={handleDropOutside}
                >
                    {' '}
                    <h3>Trash</h3>
                    <h2>Available Activities</h2>
                    <div className="activity-options">
                        {thingsToDo.map((activity) => (
                            <div
                                draggable
                                onDragStart={(e) =>
                                    handleDrag(e, activity, null, null)
                                }
                            >
                                {activity.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="days-cols">
                    {calendar.length > 0 &&
                        calendar.map((events, dayIndex) => (
                            <div className="day-column" key={dayIndex}>
                                <h2>Day {dayIndex + 1}</h2>
                                <div
                                    className="day-grid"
                                    ref={(e) =>
                                        (gridRefs.current[dayIndex] = e)
                                    }
                                >
                                    {[...Array(TEN_MIN_INTERVALS)].map(
                                        (_, i) => (
                                            <div
                                                key={i}
                                                className="time-cell"
                                                onDragOver={handleOnDragOver}
                                                onDrop={(e) =>
                                                    handleDropInside(
                                                        e,
                                                        dayIndex
                                                    )
                                                }
                                            >
                                                {i % INTERVALS_IN_HOUR === 0 &&
                                                    timeLabel(i)}
                                            </div>
                                        )
                                    )}
                                    <div>
                                        {events?.map((event, i) => (
                                            <div
                                                key={event.activity.name + i}
                                                className="event-block"
                                                draggable
                                                onDragStart={(e) =>
                                                    handleDrag(
                                                        e,
                                                        event,
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
                                                {event.activity.name}
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
