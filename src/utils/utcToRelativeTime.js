export function convertUtcToRelativeTime(utcDateTime) {
    debugger;
    if (!utcDateTime) {
        console.error("Invalid date input:", utcDateTime);
        return "Unknown time";
    }
    const now = new Date()
    console.log(now, utcDateTime);
    const pastDate = new Date(utcDateTime);

    const diffInSeconds = Math.floor(
        (now.getTime() - pastDate.getTime()) / 1000
    );
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInMonths / 12);

    if (diffInYears > 0) {
        return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
    } else if (diffInMonths > 0) {
        return diffInMonths === 1
            ? "1 month ago"
            : `${diffInMonths} months ago`;
    } else if (diffInWeeks > 0) {
        return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
    } else if (diffInDays > 0) {
        return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    } else if (diffInHours > 0) {
        return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
    } else if (diffInMinutes > 0) {
        return diffInMinutes === 1
            ? "1 minute ago"
            : `${diffInMinutes} minutes ago`;
    } else {
        return diffInSeconds === 1
            ? "1 second ago"
            : `${diffInSeconds} seconds ago`;
    }
}
