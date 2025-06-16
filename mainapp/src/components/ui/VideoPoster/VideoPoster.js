import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowsOutSimpleIcon } from '@assets/icons/ArrowsOutSimpleIcon';
import { SpeakerOffIcon } from '@assets/icons/SpeakerOffIcon';
import SpeakerOnIcon from '@assets/icons/SpeakerOnIcon/SpeakerOnIcon';
import { useWindowResize } from '@src/hooks/useWindowResize';
import styles from './videoPoster.module.scss';
const cx = classNames.bind(styles);
const VideoPoster = ({ title, subtitle, text, size = 'normal', }) => {
    const audioElementRef = useRef(null);
    const soundControlsRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const { isMobile } = useWindowResize();
    const videoClasses = {
        [size]: true,
    };
    const { i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    useEffect(() => {
        if (audioElementRef.current) {
            audioElementRef.current.setAttribute('src', '/static/promo.mp3');
            audioElementRef.current.setAttribute('loop', 'true');
        }
    }, []);
    const handleMute = () => {
        setIsMuted((prevIsMuted) => {
            if (audioElementRef.current) {
                if (prevIsMuted) {
                    audioElementRef.current.volume = 0.5;
                    audioElementRef.current.play();
                }
                else {
                    audioElementRef.current.pause();
                    audioElementRef.current.currentTime = 0;
                }
            }
            return !prevIsMuted;
        });
    };
    return (_jsxs("div", { className: cx('video', videoClasses), children: [_jsxs("video", { loop: true, muted: true, autoPlay: true, poster: "/static/Background.png", children: [_jsx("source", { src: "/static/promo.mp4", type: "video/mp4" }), _jsx("source", { src: "/static/promo.webm", type: "video/webm" })] }), _jsxs("div", { className: cx('video-wrapper'), children: [_jsxs("div", { className: cx('video-titles'), children: [_jsx("h2", { className: cx('video-titles__title'), children: title }), _jsx("p", { className: cx('video-titles__subtitle'), children: subtitle }), _jsx("span", { className: cx('video-titles__text'), children: text })] }), _jsxs("div", { className: cx('video-buttons'), children: [_jsx("a", { href: "/static/promo.mp4", children: _jsx(ArrowsOutSimpleIcon, { size: isMobile ? 24 : 32 }) }), _jsx("div", { onClick: handleMute, ref: soundControlsRef, className: "cursor-pointer", children: isMuted ? (_jsx(SpeakerOffIcon, { size: isMobile ? 40 : 73 })) : (_jsx(SpeakerOnIcon, { size: isMobile ? 40 : 73 })) })] })] }), _jsxs("audio", { loop: true, ref: audioElementRef, children: [_jsx("source", { src: "/static/promo.ogg", type: "audio/ogg" }), _jsx("source", { src: "/static/promo.mp3", type: "audio/mpeg" })] })] }));
};
export default VideoPoster;
