export function convertUtcToRelativeTime(utcTimeString) {
    const utcTime = new Date(utcTimeString);
    const now = new Date();
    const timeDifference = now.getTime() - utcTime.getTime(); // Time difference in milliseconds

    const totalSeconds = Math.floor(timeDifference / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalMonths = Math.floor(totalDays / 30); // Approximation, not exact
    const totalYears = Math.floor(totalMonths / 12); // Approximation, not exact

    if (totalYears >= 1) {
        return totalYears === 1 ? "1 year ago" : totalYears + " years ago";
    } else if (totalMonths >= 1) {
        return totalMonths === 1 ? "1 month ago" : totalMonths + " months ago";
    } else if (totalDays >= 1) {
        return totalDays === 1 ? "1 day ago" : totalDays + " days ago";
    } else if (totalHours >= 1) {
        return totalHours === 1 ? "1 hour ago" : totalHours + " hours ago";
    } else if (totalMinutes >= 1) {
        return totalMinutes === 1
            ? "1 minute ago"
            : totalMinutes + " minutes ago";
    } else {
        return totalSeconds <= 1 ? "Just now" : totalSeconds + " seconds ago";
    }
}
