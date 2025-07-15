import { useState } from 'react';
import { set } from '../../../server/api/server';

const DragDropTest = () => {
    const DAYS = 3;
    const [activityDays, setActivityDays] = useState([]);

    for (let i = 0; i < days; i++) {
        const day = `Day ${i + 1}`;
        setActivityDays((prevActivityDays) => [...prevActivityDays, day]);
    }

    const handleDrag = (e, name) => {
        e.dataTransfer.setData('name', name);
    };

    const handleOnDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        if (droppedDivs) {
            setDroppedDivs([
                ...droppedDivs.filter(
                    (name) => name !== e.dataTransfer.getData('name')
                ),
                e.dataTransfer.getData('name'),
            ]);
        } else {
            setDroppedDivs([e.dataTransfer.getData('name')]);
        }
        day1?.forEach((name) => {
            if (name === e.dataTransfer.getData('name')) {
                setDay1([
                    ...day1.filter(
                        (name) => name !== e.dataTransfer.getData('name')
                    ),
                ]);
            }
        });
        day2?.forEach((name) => {
            if (name === e.dataTransfer.getData('name')) {
                setDay2([
                    ...day2.filter(
                        (name) => name !== e.dataTransfer.getData('name')
                    ),
                ]);
            }
        });
    };

    const handleDropDay1 = (e) => {
        if (day1) {
            setDay1([
                ...day1.filter(
                    (name) => name !== e.dataTransfer.getData('name')
                ),
                e.dataTransfer.getData('name'),
            ]);
        } else {
            setDay1([e.dataTransfer.getData('name')]);
        }
        droppedDivs?.forEach((name) => {
            if (name === e.dataTransfer.getData('name')) {
                setDroppedDivs([
                    ...droppedDivs.filter(
                        (name) => name !== e.dataTransfer.getData('name')
                    ),
                ]);
            }
        });
        day2?.forEach((name) => {
            if (name === e.dataTransfer.getData('name')) {
                setDay2([
                    ...day2.filter(
                        (name) => name !== e.dataTransfer.getData('name')
                    ),
                ]);
            }
        });
    };

    const handleDropDay2 = (e) => {
        if (day2) {
            setDay2([
                ...day2.filter(
                    (name) => name !== e.dataTransfer.getData('name')
                ),
                e.dataTransfer.getData('name'),
            ]);
        } else {
            setDay2([e.dataTransfer.getData('name')]);
        }
        droppedDivs?.forEach((name) => {
            if (name === e.dataTransfer.getData('name')) {
                setDroppedDivs([
                    ...droppedDivs.filter(
                        (name) => name !== e.dataTransfer.getData('name')
                    ),
                ]);
            }
        });
        day1?.forEach((name) => {
            if (name === e.dataTransfer.getData('name')) {
                setDay1([
                    ...day1.filter(
                        (name) => name !== e.dataTransfer.getData('name')
                    ),
                ]);
            }
        });
    };

    return (
        <>
            <div>
                <h1>Drag and Drop Test</h1>
                <div draggable onDragStart={(e) => handleDrag(e, 'Test Div 1')}>
                    Test Div 1
                </div>
                <div draggable onDragStart={(e) => handleDrag(e, 'Test Div 2')}>
                    Test Div 2
                </div>
                <div draggable onDragStart={(e) => handleDrag(e, 'Test Div 3')}>
                    Test Div 3
                </div>
                <div onDragOver={handleOnDragOver} onDrop={handleDrop}>
                    <h2>Drop Here</h2>
                    {droppedDivs &&
                        droppedDivs.map((name) => (
                            <div
                                draggable
                                onDragStart={(e) => handleDrag(e, name)}
                            >
                                {name}
                            </div>
                        ))}
                </div>
                <div onDragOver={handleOnDragOver} onDrop={handleDropDay1}>
                    <h2>Day 1</h2>
                    {day1 &&
                        day1.map((name) => (
                            <div
                                draggable
                                onDragStart={(e) => handleDrag(e, name)}
                            >
                                {name}
                            </div>
                        ))}
                </div>
                <div onDragOver={handleOnDragOver} onDrop={handleDropDay2}>
                    <h2>Day 2</h2>
                    {day2 &&
                        day2.map((name) => (
                            <div
                                draggable
                                onDragStart={(e) => handleDrag(e, name)}
                            >
                                {name}
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
};
export default DragDropTest;
