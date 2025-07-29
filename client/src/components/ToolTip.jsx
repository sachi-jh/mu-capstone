import '../styles/ToolTip.css';
import iconInfo from '../../public/assets/32175.png';

const ToolTip = ({ content, position, color }) => {
    return (
        <div className="tooltip">
            <img src={iconInfo} alt="info" className={`${color}`} />
            <span className={`tooltiptext ${position}`}>{content}</span>
        </div>
    );
};
export default ToolTip;
