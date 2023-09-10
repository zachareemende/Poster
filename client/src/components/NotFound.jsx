import { Link } from 'react-router-dom'

const NotFound = () => {
    return (
        <div>
            <h1 className='text-red-600'>Oops! You seem to be lost.</h1>
            <p>Here are some helpful links:</p>
            <Link className='mb-2 text-blue-500 hover:underline' to='/'>Home</Link>
        </div>
    )
}

export default NotFound