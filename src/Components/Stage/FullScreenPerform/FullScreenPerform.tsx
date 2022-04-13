import styles from './fullScreenPerform.module.scss';

export const FullScreenPerform = () => {
    return <div className={styles.FullScreenPerform_main}>
        <div id="videoContainer"/>
        <div className={styles.introContainer} id="introContainer"/>
        <div id="pixiContianer"/>
    </div>;
};
