import zarImg from '../assets/images/zar.png';
import goharImg from '../assets/images/gohar.png';

const BASE_STYLE = {
    objectFit: 'contain',
    verticalAlign: 'middle',
    display: 'inline-block',
    flexShrink: 0,
    pointerEvents: 'none',
};

export function ZarIcon({ size, className = '' }) {
    return (
        <img
            src={zarImg}
            alt="زر"
            className={className}
            style={size ? { ...BASE_STYLE, width: size, height: size } : BASE_STYLE}
            draggable="false"
        />
    );
}

export function GoharIcon({ size, className = '' }) {
    return (
        <img
            src={goharImg}
            alt="گوهر"
            className={className}
            style={size ? { ...BASE_STYLE, width: size, height: size } : BASE_STYLE}
            draggable="false"
        />
    );
}