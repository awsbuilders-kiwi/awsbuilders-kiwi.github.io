class Calendar {
    constructor() {
        this.events = [];
        this.expandedEvents = null;
        this.currentDate = new Date();
        this.selectedDate = null;
        this.initializeElements();
        this.addEventListeners();
        this.renderCalendar();
        this.errorModal = document.getElementById('errorModal');
        this.initializeErrorHandling();
        this.discordEvents = [];
        this.twitchEvents = [];
        this.fetchAllEvents();
    }

    async fetchAllEvents() {
        await Promise.all([
            this.fetchDiscordEvents(),
            this.fetchAWSTwitchChannelEvents()
        ]);
        console.log('Discord events:', this.discordEvents.length);
        console.log('Twitch events:', this.twitchEvents.length);
        await this.generateAllEvents();
        this.renderCalendar();
    }

    initializeErrorHandling() {
        // Add error modal close handler
        const errorCloseBtn = this.errorModal.querySelector('.close-btn');
        errorCloseBtn.addEventListener('click', () => {
            this.errorModal.style.display = 'none';
        });
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        this.errorModal.style.display = 'block';
    }

    initializeElements() {
        this.monthDisplay = document.getElementById('monthDisplay');
        this.dayViewModal = document.getElementById('dayViewModal');
        this.eventDetailsModal = document.getElementById('eventDetailsModal');
        this.closeButtons = document.querySelectorAll('.close-btn');
        this.calendarGrid = document.querySelector('.calendar-grid');
        this.modals = [this.dayViewModal, this.eventDetailsModal];
    }

    addEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        window.addEventListener('click', (e) => {
            if (e.target === this.dayViewModal || e.target === this.eventDetailsModal) {
                this.closeModals();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
        this.modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });
    }

    async fetchDiscordEvents() {
        try {
            const response = await fetch('https://r18zlonkuh.execute-api.ap-southeast-2.amazonaws.com');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received from server');
            }

            this.discordEvents = data;
        } catch (error) {
            console.error('Error fetching Discord events:', error);
            this.discordEvents = [];

            let userMessage = 'Unable to load Discord calendar events. ';
            if (error.message.includes('HTTP error')) {
                userMessage += 'The server is not responding. Please try again later.';
            } else if (error.message.includes('Invalid data')) {
                userMessage += 'The server returned unexpected data.';
            } else {
                userMessage += 'Please check your internet connection and try again.';
            }

            this.showError(userMessage);
        }
    }

    async fetchAWSTwitchChannelEvents() {
        try {
            const response = await fetch('https://fxkg3j8g5e.execute-api.ap-southeast-2.amazonaws.com');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received from server');
            }

            this.twitchEvents = data;
        } catch (error) {
            console.error('Error fetching AWS Twitch channel events:', error);
            this.twitchEvents = [];

            let userMessage = 'Unable to load AWS Twitch channel calendar events. ';
            if (error.message.includes('HTTP error')) {
                userMessage += 'The server is not responding. Please try again later.';
            } else if (error.message.includes('Invalid data')) {
                userMessage += 'The server returned unexpected data.';
            } else {
                userMessage += 'Please check your internet connection and try again.';
            }

            this.showError(userMessage);
        }
    }

    async generateAllEvents() {
        const expandedEvents = [];

        // Combine Discord and Twitch events
        const allEvents = [...this.discordEvents, ...this.twitchEvents];

        for (const event of allEvents) {
            if (!event.recurrence_rule) {
                expandedEvents.push(event);
                continue;
            }

            const rule = event.recurrence_rule;
            const eventStart = new Date(event.scheduled_start_time);
            const ruleStart = new Date(rule.start);

            const targetDay = eventStart.getDay();

            // console.log(`${event.name}: Using actual event day ${targetDay}`);

            let currentDate = new Date(Math.max(eventStart.getTime(), ruleStart.getTime()));
            const hours = eventStart.getHours();
            const minutes = eventStart.getMinutes();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 6);

            expandedEvents.push(event);

            while (currentDate <= endDate) {
                if (currentDate.getTime() === eventStart.getTime()) {
                    currentDate.setDate(currentDate.getDate() + (7 * rule.interval));
                    continue;
                }

                if (currentDate.getDay() === targetDay) {
                    const recurringEvent = {
                        ...event,
                        scheduled_start_time: new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            currentDate.getDate(),
                            hours,
                            minutes
                        ).toISOString(),
                        isRecurring: true
                    };
                    expandedEvents.push(recurringEvent);
                }

                currentDate.setDate(currentDate.getDate() + (7 * rule.interval));
            }
        }

        this.expandedEvents = expandedEvents.sort((a, b) => 
            new Date(a.scheduled_start_time) - new Date(b.scheduled_start_time)
        );
    }

    navigateMonth(delta) {
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        this.currentDate = newDate;
        this.renderCalendar();
    }

    renderCalendar() {
        if (this.isRendering) return;
        this.isRendering = true;

        try {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            this.monthDisplay.textContent = new Date(year, month).toLocaleDateString('en-NZ', {
                month: 'long',
                year: 'numeric'
            });

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDay = firstDay.getDay();

            const weekdayHeaders = Array.from(this.calendarGrid.querySelectorAll('.weekday'));
            this.calendarGrid.innerHTML = '';
            weekdayHeaders.forEach(header => this.calendarGrid.appendChild(header));

            for (let i = 0; i < startingDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                this.calendarGrid.appendChild(emptyDay);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';

                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = day;
                dayElement.appendChild(dayNumber);
                const EARLIEST_HOUR = 8;
                let dayEvents = this.getEventsForDate(new Date(year, month, day));

                dayEvents = dayEvents.filter(event => {
                    const eventTime = new Date(event.scheduled_start_time);
                    return eventTime.getHours() >= EARLIEST_HOUR;
                })
                dayEvents = dayEvents.sort((a, b) => {
                    if (a.platform === b.platform) {
                        return new Date(a.scheduled_start_time) - new Date(b.scheduled_start_time);
                    }
                    return a.platform === 'discord' ? -1 : 1;  // Ensures Discord is at the top
                });
                const maxEventsPerDay = 5;
                const visibleEvents = dayEvents.slice(0, maxEventsPerDay);

                visibleEvents.forEach(event => {
                    const eventIndicator = document.createElement('div');
                    eventIndicator.className = `event-indicator ${event.platform === 'twitch' ? 'twitch-event' : ''}`;

                    // Add platform-specific styling
                    if (event.platform === 'twitch') {
                        eventIndicator.classList.add('twitch-event');
                    }

                    // Create a container for the event name and truncate if needed
                    const eventName = event.name || 'Unnamed Event';
                    const truncatedName = eventName.length > 30 ? eventName.substring(0, 27) + '...' : eventName;

                    // Create a container for the event name and user count
                    eventIndicator.innerHTML = `
                        <span class="event-name">
                            ${truncatedName}

                        ${event.platform !== 'twitch' ? `
                            <span class="user-count">
                                <i class="fas fa-user"></i> ${event.user_count || 0}

                        ` : ''}
                    `;

                    eventIndicator.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showEventDetails(event);
                    });
                    dayElement.appendChild(eventIndicator);
                });

                if (dayEvents.length > maxEventsPerDay) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.className = 'event-indicator more-events';
                    moreIndicator.textContent = `+${dayEvents.length - maxEventsPerDay} more`;
                    dayElement.appendChild(moreIndicator);
                }

                dayElement.addEventListener('click', () => {
                    this.showDayView(new Date(year, month, day), dayEvents);
                });

                this.calendarGrid.appendChild(dayElement);
            }

            const totalDays = startingDay + daysInMonth;
            const remainingDays = Math.ceil(totalDays / 7) * 7 - totalDays;
            for (let i = 0; i < remainingDays; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                this.calendarGrid.appendChild(emptyDay);
            }

        } catch (error) {
            console.error('Error rendering calendar:', error);
        } finally {
            this.isRendering = false;
        }
    }

    getEventsForDate(date) {
        if (!this.expandedEvents) return [];

        return this.expandedEvents.filter(event => {
            const eventDate = new Date(event.scheduled_start_time);
            return  eventDate.getDate() === date.getDate() &&
                    eventDate.getMonth() === date.getMonth() &&
                    eventDate.getFullYear() === date.getFullYear();
        });
    }

    showDayView(date, events) {
        const dayViewDate = document.getElementById('dayViewDate');
        const timeSlots = document.querySelector('.time-slots');

        dayViewDate.textContent = date.toLocaleDateString('en-NZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        timeSlots.innerHTML = '';

        for (let hour = 8; hour <= 22; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${hour}:00`;

            const slotEvents = events.filter(event => {
                const eventTime = new Date(event.scheduled_start_time);
                return eventTime.getHours() === hour;
            });

            slotEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'time-slot-event';
                
                // Add platform-specific class
                if (event.platform === 'twitch') {
                    eventElement.classList.add('twitch-event');
                } else {
                    eventElement.classList.add('discord-event');
                }
                
                eventElement.textContent = event.name;
                eventElement.addEventListener('click', () => this.showEventDetails(event));
                timeSlot.appendChild(eventElement);
            });

            timeSlots.appendChild(timeSlot);
        }

        this.dayViewModal.style.display = 'block';

        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            const currentHour = now.getHours();
            if (currentHour >= 8 && currentHour <= 22) {
                const scrollIndex = currentHour - 8;
                const timeSlotHeight = 60;
                timeSlots.scrollTop = scrollIndex * timeSlotHeight;
            }
        }
    }

    showEventDetails(event) {
        document.getElementById('eventTitle').textContent = event.name;

        const eventDetails = document.querySelector('.event-details');
        eventDetails.innerHTML = '';

        const addDetailRow = (label, value) => {
            const labelSpan = document.createElement('span');
            labelSpan.className = 'label';
            labelSpan.innerHTML = `<b>${label}:</b>`;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'value';
            valueSpan.textContent = value;

            eventDetails.appendChild(labelSpan);
            eventDetails.appendChild(valueSpan);
        };

        if (event.platform === 'twitch') {
            addDetailRow('Channel', 'AWS');
            addDetailRow('Description', event.description || 'No description provided');
            addDetailRow('Start Time', new Date(event.scheduled_start_time).toLocaleString('en-NZ'));
            if (event.scheduled_end_time) {
                addDetailRow('End Time', new Date(event.scheduled_end_time).toLocaleString('en-NZ'));
            }
        } else {
            addDetailRow('Presented by ', event.creator.global_name);
            addDetailRow('Description', event.description || 'No description provided');
            addDetailRow('Time', new Date(event.scheduled_start_time).toLocaleString('en-NZ'));

            let recurrenceText = 'One-time event';
            if (event.recurrence_rule) {
                recurrenceText = `Recurring every ${event.recurrence_rule.interval} week(s)`;
            }
            addDetailRow('Recurrence', recurrenceText);
        }

        // Image handling
        const imageContainer = document.getElementById('eventImage');
        if (event.platform ==='discord' && event?.id && event?.imagehash) {
            const imageUrl = `https://cdn.discordapp.com/guild-events/${event.id}/${event.imagehash}.png?size=512`;
            imageContainer.style.display = 'block';
            imageContainer.innerHTML = `<img src="${imageUrl}" alt="${event.name} Image" class="event-image"/>`;
        } else {
            imageContainer.style.display = 'none';
            imageContainer.innerHTML = '';
        }

        // Calendar Links
        const googleCalLink = this.createGoogleCalendarLink(event);
        const outlookCalLink = this.createOutlookCalendarLink(event);
        let icsCalLink;
        if (!event.platform) {
            icsCalLink = this.createICSCalendarLink(event);
        } else {
            icsCalLink = this.createTwitchICSCalendarLink(event);
        }

        // Update Calendar Links
        const calendarLinksDiv = document.getElementById('calendarLinks');
        if (!event.platform) {
            calendarLinksDiv.innerHTML = `
            <h4>Add to Calendar:</h4>
                <a href="${icsCalLink}" target="_blank" class="calendar-link">.ICS (All Cals)</a>
            <a href="${googleCalLink}" target="_blank" class="calendar-link">Google Calendar</a>
            <a href="${outlookCalLink}" target="_blank" class="calendar-link">Outlook Web</a>
            `;
        }
        else{
            calendarLinksDiv.innerHTML = `
            <h4>Add to Calendar:</h4>
            <a href="${googleCalLink}" target="_blank" class="calendar-link">Google Calendar</a>
            <a href="${outlookCalLink}" target="_blank" class="calendar-link">Outlook Web</a>
            `;
        }
        // Update Discord Links - make it so it watches in past ones direct videos/2294373585
        const discordLinksDiv = document.getElementById('discordLinks');
        if (event.platform === 'twitch') {
            discordLinksDiv.innerHTML = `
                <a href="https://twitch.tv/aws"
                    target="_blank" class="twitch-link">
                    Watch on Twitch
                </a>
            `;
        } else {
            discordLinksDiv.innerHTML = `
                <a href="discord://discord.com/events/1157469922633466058/${event.id}"
                    class="discord-link app-link">
                    Register via Discord App
                </a>
                <a href="https://discord.com/events/1157469922633466058/${event.id}"
                    target="_blank" class="discord-link">
                    Register via Browser (Discord www)
                </a>
            `;

            // Add click handler for app link
            const appLink = discordLinksDiv.querySelector('.app-link');
            appLink.addEventListener('click', (e) => {
                e.preventDefault();

                // Attempt to open Discord app
                const discordUrl = `discord://discord.com/events/1157469922633466058/${event.id}`;
                const webUrl = `https://discord.com/events/1157469922633466058/${event.id}`;

                // Create hidden iframe to try opening Discord app
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                // Try to open Discord app
                iframe.src = discordUrl;

                // If Discord app doesn't open within 2 seconds, redirect to web version
                const timeout = setTimeout(() => {
                    document.body.removeChild(iframe);
                    window.location.href = webUrl;
                }, 2000);

                // Cleanup if Discord app opens successfully
                window.addEventListener('blur', () => {
                    clearTimeout(timeout);
                    document.body.removeChild(iframe);
                }, { once: true });
            });
        }

        // Update modal display
        this.eventDetailsModal.className = 'event-details-modal';
        this.eventDetailsModal.style.display = 'block';

        // Add this line to handle modal content width based on content
        const modalContent = this.eventDetailsModal.querySelector('.modal-content');
        modalContent.style.width = 'fit-content';

        // Optional: Add escape key listener to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
                }
        });
    }


    // Updated closeModals method:
    closeModals() {
        this.modals.forEach(modal => {
            modal.style.display = 'none';
            // Remove any inline styles that might have been added
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.width = '';
            }
        });
    }

    // Calendar link creation functions
    createGoogleCalendarLink(event) {
        const eventDate = this.parseISODate(event.scheduled_start_time);
        const endDate = new Date(eventDate.getTime() + (60 * 60 * 1000)); // 1 hour duration

        const dates = {
            start: this.formatDateForCalendar(eventDate),
            end: this.formatDateForCalendar(endDate)
        };

        let recurrence = '';
        if (event.recurrence_rule) {
            // Properly encode the RRULE for Google Calendar
            const rrule = `RRULE:FREQ=WEEKLY;INTERVAL=${event.recurrence_rule.interval}`;
            recurrence = `&recur=${encodeURIComponent(rrule)}`;
        }

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${dates.start}/${dates.end}&details=${encodeURIComponent(event.description || '')}${recurrence}`;
    }

    createOutlookCalendarLink(event) {
        const eventDate = this.parseISODate(event.scheduled_start_time);
        const endDate = new Date(eventDate.getTime() + (60 * 60 * 1000)); // 1 hour duration

        let description = event.description || '';
        if (event.recurrence_rule) {
            description += `\n\nThis event repeats every ${event.recurrence_rule.interval} week(s)`;
        }

        const params = {
            subject: encodeURIComponent(event.name),
            startdt: eventDate.toISOString(),
            enddt: endDate.toISOString(),
            body: encodeURIComponent(description)
        };

        const queryString = Object.keys(params)
            .map(key => `${key}=${params[key]}`)
            .join('&');

        return `https://outlook.office.com/calendar/0/deeplink/compose?${queryString}`;
    }

    createICSCalendarLink(event) {
        return `generate_ics.php?id=${encodeURIComponent(event.id)}`;
    }

    createTwitchICSCalendarLink(event) {
        return `generate_ics_twitch.php?id=${encodeURIComponent(event.id)}`;
    }

    parseISODate(dateString) {
        try {
            if (!dateString) return null;
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                // console.error('Invalid date:', dateString);
                return null;
            }

            return date;
        } catch (error) {
            // console.error('Error parsing ISO date:', dateString, error);
            return null;
        }
    }

    formatDateForCalendar(date) {
        if (!date) return null;
        try {
            return date.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15);
        } catch (error) {
            // console.error('Error formatting date for calendar:', error);
            return null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});