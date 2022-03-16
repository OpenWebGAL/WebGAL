import {FC} from 'react'
import styles from './title.module.scss'

const Title: FC = () => {
    return <>
        {<div className={styles.Title_main}
              style={{backgroundImage: `url("")`}}>
            Title
            <div>
                closeTitle
            </div>
        </div>}
    </>
}

export default Title;