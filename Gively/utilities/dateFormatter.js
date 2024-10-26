export const formatDate = (date) => {
    // Handle both Firestore Timestamp and ISO string
    const dateObj = date instanceof Date 
        ? date 
        : date?.toDate?.() // Convert Firestore Timestamp to Date
            ? date.toDate()
            : new Date(date); // Handle ISO string

    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
        console.warn('Invalid date value:', date);
        return 'Invalid Date';
    }

    const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', optionsDate);
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = dateObj.toLocaleTimeString('en-US', optionsTime);
    return `${formattedDate} • ${formattedTime}`;
};

export const timestampToISO = (timestamp) => {
  if (!timestamp) return null;
  return timestamp?.toDate?.() 
      ? timestamp.toDate().toISOString()
      : new Date(timestamp).toISOString();
};