import '../styles/ToolTip.css';
const ToolTip = ({ content, position, color }) => {
    return (
        <div className="tooltip">
            <img
                src="../src/assets/32175.png"
                alt="info"
                className={`${color}`}
            />
            <span className={`tooltiptext ${position}`}>{content}</span>
        </div>
    );
};
export default ToolTip;
