import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ToolsService {

    constructor() {
    }


    timeago(timestamp: Date): string {
        // let tmp = new Date();
        let distanceMillis: number = (Date.now() - timestamp.valueOf());
        let strings = {
            prefixAgo: null,
            prefixFromNow: null,
            suffixAgo: "ago",
            suffixFromNow: "from now",
            inPast: 'any moment now',
            seconds: "less than a minute",
            minute: "about a minute",
            minutes: "%d minutes",
            hour: "about an hour",
            hours: "about %d hours",
            day: "a day",
            days: "%d days",
            month: "about a month",
            months: "%d months",
            year: "about a year",
            years: "%d years",
            wordSeparator: " ",
            numbers: []
        };
        let prefix = strings.prefixAgo;
        let suffix = strings.suffixAgo;

        let seconds = Math.abs(distanceMillis) / 1000;
        let minutes = seconds / 60;
        let hours = minutes / 60;
        let days = hours / 24;
        let years = days / 365;

        function substitute(stringOrFunction, number) {
            let string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
            let value = (strings.numbers && strings.numbers[number]) || number;
            return string.replace(/%d/i, value);
        }

        let words = seconds < 45 && substitute(strings.seconds, Math.round(seconds)) ||
            seconds < 90 && substitute(strings.minute, 1) ||
            minutes < 45 && substitute(strings.minutes, Math.round(minutes)) ||
            minutes < 90 && substitute(strings.hour, 1) ||
            hours < 24 && substitute(strings.hours, Math.round(hours)) ||
            hours < 42 && substitute(strings.day, 1) ||
            days < 30 && substitute(strings.days, Math.round(days)) ||
            days < 45 && substitute(strings.month, 1) ||
            days < 365 && substitute(strings.months, Math.round(days / 30)) ||
            years < 1.5 && substitute(strings.year, 1) ||
            substitute(strings.years, Math.round(years));

        let separator = strings.wordSeparator || "";
        if (strings.wordSeparator === undefined) {
            separator = " ";
        }
        return $.trim([prefix, words, suffix].join(separator));
    }
}
