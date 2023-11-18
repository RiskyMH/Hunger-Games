import { useEffect, useState } from "react"

export default function Loading() {
    const [count, setCount] = useState(1)

    useEffect(() => {
        setCount(2)
        const interval = setInterval(() => setCount(count => count === 3 ? 1 : count + 1), 200)
        return () => clearInterval(interval)
    }, [])

    return <span style={{ fontSize: '4rem' }} className="dark:text-white">
        Loading{'.'.repeat(count)}
    </span>
}