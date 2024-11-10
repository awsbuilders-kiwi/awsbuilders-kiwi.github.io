<?php
header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="event.ics"');

// Get the event ID from the URL
$eventId = isset($_GET['id']) ? $_GET['id'] : null;

if (!$eventId) {
    die('Event ID is required.');
}

// Fetch the event data from the API
$apiUrl = 'https://t959lil5o8.execute-api.ap-southeast-2.amazonaws.com';
$response = @file_get_contents($apiUrl);

if ($response === false) {
    die('Error fetching event data from API.');
}

$events = json_decode($response, true);

if (!is_array($events)) {
    die('Invalid event data received.');
}

// Find the event by its ID
$event = null;
foreach ($events as $ev) {
    if ($ev['id'] == $eventId) {
        $event = $ev;
        break;
    }
}

if (!$event) {
    die('Event not found.');
}

// Function to properly escape text for ICS
function escapeICSText($text) {
    $text = str_replace(array("\r\n", "\n", "\r"), "\\n", $text);
    $text = addcslashes($text, ',;');
    return $text;
}

// Function to format timestamp for ICS
function formatICSTimestamp($timestamp) {
    return date('Ymd\THis\Z', strtotime($timestamp));
}

// Generate unique identifier for the event
$domain = 'yourdomain.com'; // Replace with your actual domain
$uid = $event['id'] . '@' . $domain;

// Prepare event times
$startTime = formatICSTimestamp($event['scheduled_start_time']);
$endTime = formatICSTimestamp(date('c', strtotime($event['scheduled_start_time']) + 3600)); // 1 hour duration

// Prepare event details
$eventName = escapeICSText($event['name']);
$eventDescription = escapeICSText($event['description'] ?? '');

// Build the ICS content
$ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your Organization//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' . $uid,
    'DTSTAMP:' . formatICSTimestamp(date('c')),
    'DTSTART:' . $startTime,
    'DTEND:' . $endTime,
    'SUMMARY:' . $eventName,
    'DESCRIPTION:' . $eventDescription,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE'
];

// Add recurrence rule if it exists
if (isset($event['recurrence_rule']) && isset($event['recurrence_rule']['interval'])) {
    $interval = $event['recurrence_rule']['interval'];
    
    // Build the RRULE
    $rrule = 'RRULE:FREQ=WEEKLY';
    $rrule .= ';INTERVAL=' . $interval;
    
    // Optional: Add count or until date if you want to limit the recurrence
    // $rrule .= ';COUNT=52'; // For example, limit to 52 occurrences
    // Or
    // $rrule .= ';UNTIL=20251231T235959Z'; // For example, until end of 2025
    
    $ics[] = $rrule;
}

// Close the calendar
$ics[] = 'END:VEVENT';
$ics[] = 'END:VCALENDAR';

// Output the ICS content
echo implode("\r\n", $ics);
?>
