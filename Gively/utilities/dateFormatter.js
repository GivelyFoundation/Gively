export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime);
    return `${formattedDate} • ${formattedTime}`;
  };