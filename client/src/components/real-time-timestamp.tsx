import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';

interface RealTimeTimestampProps {
  date: Date | string;
  showRelative?: boolean;
  showFullDate?: boolean;
  className?: string;
}

export function RealTimeTimestamp({ 
  date, 
  showRelative = true, 
  showFullDate = false,
  className = "" 
}: RealTimeTimestampProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds for more frequent updates
    
    return () => clearInterval(timer);
  }, []);

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (showFullDate) {
    return (
      <span className={className} title={formatDistanceToNow(dateObj, { addSuffix: true })}>
        {format(dateObj, 'MMM dd, yyyy HH:mm')}
      </span>
    );
  }
  
  if (showRelative) {
    return (
      <span className={className} title={format(dateObj, 'MMM dd, yyyy HH:mm')}>
        {formatDistanceToNow(dateObj, { addSuffix: true })}
      </span>
    );
  }
  
  return (
    <span className={className}>
      {format(dateObj, 'MMM dd, yyyy')}
    </span>
  );
}

export function CurrentTime({ className = "" }: { className?: string }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for current time
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <span className={className}>
      {format(currentTime, 'MMM dd, yyyy HH:mm:ss')}
    </span>
  );
}

// Add default export for backward compatibility
export default RealTimeTimestamp;