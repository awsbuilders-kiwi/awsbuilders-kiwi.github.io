<?php
header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="twitch_event.ics"');

// Configuration
$config = [
    'broadcaster_id' => '123',
    'client_id' => '123',
    'access_token' => '123'
];

// Function to handle errors
function handleError($message) {
    header('HTTP/1.1 500 Internal Server Error');
    die($message);
}

// Get the event ID from the URL
$eventId = isset($_GET['id']) ? $_GET['id'] : null;

if (!$eventId) {
    handleError('Event ID is required.');
}

// Fetch the event data from the Twitch API
$twitchApiUrl = "https://api.twitch.tv/helix/schedule?broadcaster_id={$config['broadcaster_id']}";
$options = [
    'http' => [
        'header' => [
            "Client-ID: {$config['client_id']}",
            "Authorization: Bearer {$config['access_token']}"
        ]
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($twitchApiUrl, false, $context);

if ($response === false) {
    handleError('Error fetching event data from Twitch API.');
}

$events = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    handleError('Error parsing Twitch API response.');
}

// Parse the Twitch API response and find the specific event
$event = null;
if (isset($events['data']) && is_array($events['data'])) {
    foreach ($events['data'] as $ev) {
        if ($ev['id'] == $eventId) {
            $event = $ev;
            break;
        }
    }
}

if (!$event) {
    handleError('Event not found.');
}

// Helper functions
function escapeICSText($text) {
    $text = str_replace(array("\r\n", "\n", "\r"), "\\n", $text);
    $text = addcslashes($text, ',;');
    return $text;
}

function formatICSTimestamp($timestamp) {
    return date('Ymd\THis\Z', strtotime($timestamp));
}

// Generate ICS content for Twitch event
$domain = 'twitch.tv';
$uid = $event['id'] . '@' . $domain;

// Prepare event times
$startTime = formatICSTimestamp($event['start_time']);
$endTime = formatICSTimestamp($event['end_time']);

// Prepare event details
$eventName = escapeICSText($event['title']);
$eventDescription = escapeICSText($event['category']['name'] ?? '');

$ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Twitch//Stream Schedule//EN',
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
if (isset($event['is_recurring']) && $event['is_recurring']) {
    $rrule = 'RRULE:FREQ=WEEKLY';
    
    // If start date is available, set it as the recurrence start
    if (isset($event['start_time'])) {
        $rrule .= ';DTSTART=' . formatICSTimestamp($event['start_time']);
    }
    
    // If end date is available, set it as the recurrence end
    if (isset($event['end_time'])) {
        $rrule .= ';UNTIL=' . formatICSTimestamp($event['end_time']);
    }
    
    $ics[] = $rrule;
}

// Close the calendar
$ics[] = 'END:VEVENT';
$ics[] = 'END:VCALENDAR';

// Output the ICS content
echo implode("\r\n", $ics);