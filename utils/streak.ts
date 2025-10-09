
export const calculateStreak = (dates: string[]) => {
    if (dates.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    const sortedDates = [...new Set(dates)].sort().map(d => new Date(d));

    let longestStreak = 0;
    let currentStreak = 0;
    
    if (sortedDates.length > 0) {
        longestStreak = 1;
        currentStreak = 1;
    }

    for (let i = 1; i < sortedDates.length; i++) {
        const diff = (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }
    
    longestStreak = Math.max(longestStreak, currentStreak);
    
    // Check if the current streak is active until today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCompletion = sortedDates[sortedDates.length - 1];
    const diffFromToday = (today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffFromToday > 1) {
        currentStreak = 0;
    }
    
    return { currentStreak, longestStreak };
};
