import { FunctionComponent, MouseEvent } from 'react'
export const Close: FunctionComponent<{ onClick: (e: MouseEvent<HTMLElement>) => void, src: string, id: string }> = ({ onClick: handleClick, src, id }) => {
    return (
        <div id={id} onClick={handleClick}>
            <img src={src} className="closeSVG" alt="close" />
        </div>
    )
}