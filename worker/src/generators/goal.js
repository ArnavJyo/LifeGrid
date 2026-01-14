import { createSVG, rect, circle, text, arc, parseColor, colorWithAlpha } from '../svg.js';
import { getDateInTimezone, getDaysBetween } from '../timezone.js';

/**
 * Generate Goal Countdown Wallpaper
 * Shows countdown to a specific goal date with circular progress
 */
export function generateGoalCountdown(options) {
    const {
        width,
        height,
        bgColor,
        accentColor,
        timezone,
        goalDate,
        goalName = 'Goal'
    } = options;

    // Get current date in user's timezone
    const { year, month, day } = getDateInTimezone(timezone);
    const now = new Date(year, month - 1, day);

    // Parse goal date
    let targetDate;
    if (goalDate) {
        const [goalYear, goalMonth, goalDay] = goalDate.split('-').map(Number);
        targetDate = new Date(goalYear, goalMonth - 1, goalDay);
    } else {
        // Default: 30 days from now
        targetDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate days remaining
    const daysRemaining = Math.max(0, getDaysBetween(now, targetDate));

    // For progress, assume a reasonable span (e.g., from 365 days ago to goal)
    const totalDays = Math.max(daysRemaining + 1, 365);
    const daysElapsed = totalDays - daysRemaining;
    const progress = Math.min(1, daysElapsed / totalDays);

    let content = '';

    // Background
    content += rect(0, 0, width, height, parseColor(bgColor));

    // Center point
    const centerX = width / 2;
    const centerY = height * 0.45;

    // Circular progress
    const radius = width * 0.25;
    const strokeWidth = width * 0.03;

    // Background circle
    content += circle(centerX, centerY, radius, 'none');
    content += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="${colorWithAlpha('#ffffff', 0.1)}" stroke-width="${strokeWidth}" fill="none" />`;

    // Progress arc
    if (progress > 0) {
        const endAngle = progress * 360;
        content += arc(centerX, centerY, radius, 0, endAngle, parseColor(accentColor), strokeWidth);
    }

    // Days number
    content += text(centerX, centerY - height * 0.02, daysRemaining.toString(), {
        fill: parseColor(accentColor),
        fontSize: width * 0.18,
        fontWeight: '700',
        textAnchor: 'middle',
        dominantBaseline: 'middle'
    });

    // "days" label
    content += text(centerX, centerY + height * 0.06, daysRemaining === 1 ? 'day' : 'days', {
        fill: colorWithAlpha('#ffffff', 0.6),
        fontSize: width * 0.04,
        fontWeight: '400',
        textAnchor: 'middle',
        dominantBaseline: 'middle'
    });

    // Goal name
    content += text(centerX, height * 0.72, decodeURIComponent(goalName), {
        fill: '#ffffff',
        fontSize: width * 0.05,
        fontWeight: '600',
        textAnchor: 'middle',
        dominantBaseline: 'middle'
    });

    // Target date
    const dateStr = targetDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    content += text(centerX, height * 0.78, dateStr, {
        fill: colorWithAlpha('#ffffff', 0.4),
        fontSize: width * 0.03,
        fontWeight: '400',
        textAnchor: 'middle',
        dominantBaseline: 'middle'
    });

    // Motivational text based on days remaining
    let motivation = '';
    if (daysRemaining === 0) {
        motivation = "Today's the day! 🎯";
    } else if (daysRemaining <= 7) {
        motivation = 'Almost there! Final stretch.';
    } else if (daysRemaining <= 30) {
        motivation = 'Less than a month to go!';
    } else if (daysRemaining <= 100) {
        motivation = 'Making great progress.';
    } else {
        motivation = 'Stay focused. Every day counts.';
    }

    content += text(centerX, height * 0.88, motivation, {
        fill: colorWithAlpha('#ffffff', 0.3),
        fontSize: width * 0.025,
        fontWeight: '400',
        textAnchor: 'middle',
        dominantBaseline: 'middle'
    });

    return createSVG(width, height, content);
}
